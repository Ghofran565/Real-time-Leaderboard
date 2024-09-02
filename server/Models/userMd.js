import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		nametag: {
			type: String,
			required: [true, 'Username is required.'],
			unique: [true, 'Username was taken.'],
			minLength: [3, 'Username has to have 3 charecter at least.'],
			minLength: [32, 'Username has to not have more then 32 charecter.'],
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
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
