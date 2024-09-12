import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import Tournament from '../Models/tournamentMd.js';
import Board from '../Models/boardMd.js';

export const getAllTournament = catchAsync(async (req, res, next) => {
	const features = new ApiFeatures(Tournament, req.query)
		.filters()
		.sort()
		.limitFields()
		.paginate()
		.populate('gameId');

	const tournaments = await features.query;

	return res.status(200).json({
		success: true,
		data: {
			tournaments,
		},
	});
});

export const getTournament = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const tournament = await Tournament.findById(id);

	if (!tournament) {
		return next(new HandleError('Tournament not found.', 404));
	}

	return res.status(200).json({
		success: true,
		data: {
			tournament,
		},
	});
});

export const addTournament = catchAsync(async (req, res, next) => {
	const tournament = req.body;

	const now = Date.now();

	const startTime = parseInt(tournament.startTime, 10);
	const endTime = parseInt(tournament.endTime, 10);

	if (startTime >= endTime) {
		return next(new HandleError('End time cannot be before start time.'));
	}

	if (now >= endTime) {
		return next(new HandleError('End time cannot be before now.'));
	}

	// Check for existing active tournament for the same game
	const activeTournament = await Tournament.findOne({
		gameId: tournament.gameId,
		status: 'active',
	});

	if (activeTournament) {
		return next(
			new HandleError('There can only be one active tournament per game.')
		);
	}

	// Check for overlapping times with other tournaments for the same game
	const overlappingTournaments = await Tournament.find({
		gameId: tournament.gameId,
		$or: [
			{
				startTime: { $lt: endTime },
				endTime: { $gt: startTime },
			},
			{ startTime: { $lt: startTime }, endTime: { $gt: endTime } }, // Fully contained within existing tournament
		],
	});

	if (overlappingTournaments.length > 0) {
		return next(
			new HandleError(
				'New tournament conflicts with existing tournament times.'
			)
		);
	}

	const createdTournament = await Tournament.create(tournament);

	const currentTime = Date.now();
	if (startTime <= currentTime) {
		scheduleTournamentEnd(createdTournament);
	}

	res.status(201).json({
		success: true,
		data: createdTournament,
		message: 'Tournament created successfully.',
	});
});

export const allCurrentTournament = catchAsync(async (req, res, next) => {
	const now = Date.now();

	// Find current active tournaments (if any)
	const activeTournaments = await Tournament.find({
		startTime: { $lte: now },
		endTime: { $gte: now },
	}).populate('gameId');

	// If active tournaments is found, return it
	if (activeTournaments) {
		return res.status(200).json({
			success: true,
			data: {
				activeTournaments,
			},
		});
	}
});

export const currentTournament = catchAsync(async (req, res, next) => {
	const { id: gameId } = req.params;

	const now = Date.now();

	// Find the current active tournament (if any)
	const activeTournament = await Tournament.findOne({
		gameId,
		startTime: { $lte: now },
		endTime: { $gte: now },
	}).populate('gameId');

	// If an active tournament is found, return it
	if (activeTournament) {
		return res.status(200).json({
			success: true,
			data: {
				tournament: activeTournament,
			},
		});
	}

	// No active tournament, find the next upcoming tournament
	const nextTournament = await Tournament.findOne({
		gameId,
		startTime: { $gt: now },
	})
		.sort({ startTime: 1 }) // Sort by start time to get the closest upcoming tournament
		.populate('gameId'); // Only populate game name

	// If a next tournament exists, return its start time, name, and game details
	if (nextTournament) {
		return res.status(200).json({
			success: true,
			data: {
				nextTournament: {
					startTime: nextTournament.startTime,
					name: nextTournament.name,
					game: nextTournament.gameId,
				},
			},
		});
	}

	// If no active or upcoming tournament, return nothing
	return res.status(200).json({
		success: true,
		data: null,
	});
});

export const deleteTournament = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const deletedTournament = await Tournament.findByIdAndDelete(id);

	if (!deletedTournament) {
		return next(new HandleError('Tournament not found.', 404));
	}

	return res.status(200).json({
		success: true,
		message: `Tournament with ID ${id} deleted successfully.`,
	});
});

///////////////////////////////////////////////////////////////

// Function to distribute prizes
const distributePrizes = async (tournament) => {
	const board = await Board.find({ tournamentId: tournament._id }).sort({
		score: -1,
	});

	//todo solveing prob about board

	if (!board.length) {
		console.log(`No participants for tournament ${tournament.name}.`);
		return;
	}

	const prizes = tournament.prize;

	for (let i = 0; i < prizes.length && i < board.length; i++) {
		const user = await User.findById(board[i].userId); //TODO prob created by chenging board Md

		if (user) {
			user.prizes.push({
				tournamentId: tournament._id,
				prize: prizes[i], // Assign prize based on the order of the prize array
			});
			await user.save();
			console.log(`Prize ${prizes[i]} added to user ${user.nameTag}`);
		}
	}
};

// Function to handle tournament end
const onTournamentEnd = async (tournament) => {
	try {
		console.log(`Tournament ${tournament.name} has ended.`);

		// Distribute prizes based on the board ranking
		await distributePrizes(tournament);

		// Mark the tournament as finished
		tournament.status = 'finished';
		await tournament.save();
	} catch (error) {
		console.error('Error handling tournament end:', error);
	}
};

// Schedule the tournament to end
const scheduleTournamentEnd = (tournament) => {
	const currentTime = Date.now();
	const endTime = parseInt(tournament.endTime, 10);

	const timeUntilEnd = endTime - currentTime;

	if (timeUntilEnd > 0) {
		console.log(
			`Tournament ${tournament.name} will end in ${
				timeUntilEnd / 1000
			} seconds.`
		);
		setTimeout(() => onTournamentEnd(tournament), timeUntilEnd);
	} else {
		onTournamentEnd(tournament); // Already ended? Handle it immediately.
	}
};

// Schedule active tournaments when server starts
export const scheduleActiveTournaments = async () => {
	const currentTime = Date.now();

	// Find all active tournaments where the current time is between startTime and endTime
	const activeTournaments = await Tournament.find({
		startTime: { $lte: currentTime },
		endTime: { $gt: currentTime },
		status: { $ne: 'finished' }, //! mybe no need
	});

	for (const tournament of activeTournaments) {
		scheduleTournamentEnd(tournament);
	}
};
