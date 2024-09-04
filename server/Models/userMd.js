import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema({
	tournamentName: {
		type: String,
		required: [true, 'Tournament name is required for the prize.'],
	},
	prize: {
		type: String,
		required: [true, 'Prize detail is required.'],
	},
});

const userSchema = new mongoose.Schema(
	{
		nametag: {
			type: String,
			required: [true, 'Username is required.'],
			unique: [true, 'Username was taken.'],
			minLength: [3, 'Username has to have 3 characters at least.'],
			maxLength: [32, 'Username has to not have more than 32 characters.'],
		},
		email: {
			type: String,
			required: [true, 'Email is required.'],
			unique: [true, 'Email already used.'],
			match: [/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g, 'Email is invalid.'],
		},
		password: {
			type: String,
			match: [/^(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g, 'Password invalid'],
		},
		profileImage: {
			type: String,
		},
		role: {
			type: String,
			default: 'user',
			enum: ['user', 'admin'],
		},
		prizes: [prizeSchema],
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
