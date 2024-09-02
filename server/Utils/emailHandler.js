import nodemailer from 'nodemailer';
import crypto from 'crypto';
import EmailVerification from '../Models/emailVerificationMd.js';
import HandleError from './handleError.js';
import catchAsync from '../Utils/catchAsync.js';

const createTransporter = () => {
	return nodemailer.createTransport({
		//? maybe wanna not to use gmail 
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
};

const generateVerificationCode = () => {
	return crypto.randomInt(10000, 99999).toString();
};

const sendMail = async (transporter, mailOptions) => {
	await transporter.sendMail(mailOptions);
};

export const sendEmailCode = catchAsync(async (email, next) => {
	const generatedCode = generateVerificationCode();
	await EmailVerification.create({ email, code: generatedCode });

	const transporter = createTransporter();
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: '👋 Hello from Node.js 🚀',
		text: `This is a test email sent from Node.js using nodemailer. 📧💻 Your email is ${email}, and your code is ${generatedCode}. It expires in 5 minutes.`,
	};

	try {
		await sendMail(transporter, mailOptions);
	} catch (error) {
		return next(new HandleError('Could not send the email. Please try again later.', 500));
	}

	return {
		success: true,
		message: 'Email sent successfully.',
	};
});

export const verifyEmailCode = catchAsync(async (email, code) => {
	const emailVerificationCheck = await EmailVerification.findOne({
		email,
		code,
	});

	if (!emailVerificationCheck) {
		return {
			authorized: false,
			// message: 'Verification code is incorrect or expired.',
		};
	} else {
		await EmailVerification.deleteMany({ email });
		return {
			authorized: true,
			// message: 'Email authorized successfully.',
		};
	}
});
