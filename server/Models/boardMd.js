import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    score: {
      type: Number, // Changed from Int32Array to Number to avoid potential issues.
      required: [true, 'Score is required.'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'Game ID is required.'],
    },
    isFalse: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Board = mongoose.model('Board', boardSchema);

export default Board;
