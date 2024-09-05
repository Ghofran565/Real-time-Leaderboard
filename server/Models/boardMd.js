import mongoose from 'mongoose';

const userDataSchema = new mongoose.Schema({
	score: {
		type: Number,
		required: [true, 'Score is required.'],
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User ID is required.'],
	},
	isFalse: {
		type: Boolean,
		default: false,
	},
});

const boardSchema = new mongoose.Schema(
	{
		gameId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Game',
			required: [true, 'Game ID is required.'],
		},
		userData: [userDataSchema],
	},
	{ timestamps: true }
);

const Board = mongoose.model('Board', boardSchema);

export default Board;
