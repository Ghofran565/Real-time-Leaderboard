import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Game must have a name.'],
      minLength: [3, 'Game name must have at least 3 characters.'],
      maxLength: [64, 'Game name must not exceed 64 characters.'],
    },
    // lvlIn: {
    //   type: String,
    //   minLength: [1, 'Level identifier must have at least 1 character.'],
    //   maxLength: [16, 'Level identifier must not exceed 16 characters.'],
    // },
  },
  { timestamps: true }
);

const Game = mongoose.model('Game', gameSchema);
export default Game;
