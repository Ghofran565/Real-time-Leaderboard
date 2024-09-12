import catchAsync from '../Utils/catchAsync.js';
import Game from '../Models/gameMd.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import Board from '../Models/boardMd.js';
import Tournament from '../Models/tournamentMd.js';

export const getAllGame = catchAsync(async (req, res, next) => {
	const features = new ApiFeatures(Game, req.query)
		.filters()
		.sort()
		.limitFields()
		.paginate()
		.populate();
	const data = await features.query;
	return res.status(200).json({
		success: true,
		data: { data },
	});
});

export const getGame = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const data = await Game.findById(id);

	if (!data) {
		return next(new HandleError(`Game with ID ${id} not found.`, 404));
	}

	return res.status(200).json({
		success: true,
		data: { data },
	});
});

export const createGame = catchAsync(async (req, res, next) => {
	const data = await Game.create(req?.body);
	return res.status(201).json({
		success: true,
		data: { data },
	});
});

export const updateGame = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const data = await Game.findByIdAndUpdate(id, req?.body, {
		new: true,
		runValidators: true,
	});
	if (!data) {
		return next(new HandleError(`Game with ID ${id} not found.`, 404));
	}
	return res.status(200).json({
		success: true,
		message: `Game with ID ${id} updated successfully.`,
		data: { data },
	});
});

export const deleteGame = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const game = await Game.findByIdAndDelete(id);
	if (!game) {
		return next(new HandleError('Game not found.', 404));
	}

	await Board.deleteMany({ gameId: id }); //! maybe just onedelete needed
	await Tournament.deleteMany({ gameId: id });//! maybe just onedelete needed

	return res.status(200).json({
		success: true,
		message: `Game with ID ${id} and related data deleted successfully.`,
	});
});
