import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import Tournament from '../Models/tournamentMd.js';
import Board from '../Models/boardMd.js';

export const getAllTournament = catchAsync(async (req, res, next) => {
	// Fetch all tournaments
	const tournaments = await Tournament.find().populate('gameId');
	return res.status(200).json({
		success: true,
		data: {
			tournaments,
		},
	});
});

export const addTournament = catchAsync(async (req, res, next) => {
	const tournament = await Tournament.create(req.body);

	const currentTime = Date.now();
	const startTime = parseInt(tournament.startTime, 10);

	if (startTime <= currentTime) {
		scheduleTournamentEnd(tournament);
	} //

	res.status(201).json({
		success: true,
		data: tournament,
		message: 'Tournament created successfully.',
	});
});
export const currentTournament = catchAsync(async (req, res, next) => {
	const now = Date.now(); // Get the current timestamp in milliseconds

	// Find the current active tournament (if any)
	const activeTournament = await Tournament.findOne({
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

export const submitTournament = catchAsync(async (req, res, next) => {});

export const updateTournament = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const updatedTournament = await Tournament.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updatedTournament) {
		return next(new HandleError(`Tournament with ID ${id} not found.`, 404));
	}

	return res.status(200).json({
		success: true,
		message: `Tournament with ID ${id} updated successfully.`,
		data: { updatedTournament },
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
