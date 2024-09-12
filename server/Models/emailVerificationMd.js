import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	code: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: '5min',
	},
});

const EmailVerification = mongoose.model(
	'emailVerification',
	emailVerificationSchema
);

export default EmailVerification;
