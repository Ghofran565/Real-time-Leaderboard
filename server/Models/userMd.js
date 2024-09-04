import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nametag: {
      type: String,
      required: [true, 'Username is required.'],
      unique: [true, 'Username is already taken.'],
      minLength: [3, 'Username must have at least 3 characters.'],
      maxLength: [32, 'Username must not exceed 32 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: [true, 'Email is already in use.'],
      match: [
        /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g,
        'Email is invalid.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      match: [
        /^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g,
        'Password must be at least 8 characters long and contain both letters and numbers.',
      ],
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
