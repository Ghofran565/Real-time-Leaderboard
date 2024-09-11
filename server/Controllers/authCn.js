import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import { sendEmailCode, verifyEmailCode } from '../Utils/emailHandler.js';
import User from '../Models/userMd.js';

const emailRegex = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g;
const verificationCodeRegex = /\b\d{5}\b/g;
const passwordRegex = /(?=.*?[a-z])(?=.*?[0-9]).{8,}$/g;

const generateToken = (user, additionalPayload = {}) => {
	const payload = {
		id: user._id,
		email: user.email,
		role: user.role,
		...additionalPayload,
	};
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' });
};

export const register = catchAsync(async (req, res, next) => {
	const { email, password, nametag } = req?.body;

	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	if (!passwordRegex.test(password)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}
	if (!nametag) {
		return next(new HandleError('Nametag is required.', 400));
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return next(new HandleError('Email is already registered.', 400));
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);

	const newUser = await User.create({
		email,
		password: hashedPassword,
		nametag,
	});

	const token = generateToken(newUser);

	return res.status(201).json({
		success: true,
		message: 'User registered successfully.',
		data: {
			token,
			user: {
				nametag: newUser.nametag,
				email: newUser.email,
				profileImage: newUser.profileImage,
			},
		},
	});
});

export const auth = catchAsync(async (req, res, next) => {
	const { email } = req?.body;
	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}

	const user = await User.findOne({ email });

	if (!user || !user.password) {
		await sendEmailCode(email);
		return res.status(200).json({
			success: true,
			message: `Email with code to ${email} sent successfully.`,
			isExist: !!user,
		});
	}

	return res.status(200).json({
		success: true,
		isExist: true,
	});
});

export const sendingEmailCode = catchAsync(async (req, res, next) => {
	const { email } = req?.body;
	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	await sendEmailCode(email);
	return res.status(200).json({
		success: true,
		message: `Email with code to ${email} sent successfully.`,
	});
});

export const verifyingEmailCode = catchAsync(async (req, res, next) => {
	const { email, code } = req?.body;

	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	if (!verificationCodeRegex.test(code)) {
		return next(new HandleError('Invalid verification code format.', 400));
	}

	const verificationResult = await verifyEmailCode(email, code);
	if (!verificationResult.authorized) {
		return next(
			new HandleError('Verification code is incorrect or expired.', 401)
		);
	}

	let user = await User.findOne({ email });
	const token = generateToken(user);

	return res.status(200).json({
		success: true,
		data: {
			token,
			user: {
				nametag: user.nametag,
				email: user.email,
				role: user.role,
				profileImage: user.profileImage,
				prizes: user.prizes,
			},
		},
		isCodeValidated: true,
		message: 'Email verified successfully.',
	});
});

export const forgetPassword = catchAsync(async (req, res, next) => {
	const { email } = req?.body;
	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	const user = await User.findOne({ email });
	if (!user) {
		return next(new HandleError('User not found. Please sign up first.', 404));
	}
	await sendEmailCode(email);
	return res.status(200).json({
		success: true,
		message: `Email with code to ${email} sent successfully.`,
	});
});

export const checkForgetPassword = catchAsync(async (req, res, next) => {
	const { email, code } = req?.body;
	if (!emailRegex.test(email)) {
		return next(new HandleError('Invalid email format.', 400));
	}
	if (!verificationCodeRegex.test(code)) {
		return next(new HandleError('Invalid verification code format.', 400));
	}
	const user = await User.findOne({ email });
	if (!user) {
		return next(new HandleError('User not found. Please sign up first.', 404));
	}
	const verificationResult = await verifyEmailCode(email, code);
	if (!verificationResult.authorized) {
		return next(new HandleError('Invalid verification code.', 401));
	}
	const token = generateToken(user, { changePassword: true });
	return res.status(200).json({
		success: true,
		data: { token },
		isCodeValidated: true,
		message: 'Verification code validated successfully.',
	});
});

export const changePassword = catchAsync(async (req, res, next) => {
	const { id: bodyId, password } = req?.body;
	const { id, changePassword } = req.decodedToken;

	if (!changePassword) {
		return next(
			new HandleError('Unauthorized request to change password.', 401)
		);
	}

	if (id !== bodyId) {
		return next(
			new HandleError('Unauthorized request. User ID mismatch.', 401)
		);
	}

	if (!passwordRegex.test(password)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	}

	const hashedPassword = bcryptjs.hashSync(password, 10);
	const user = await User.findByIdAndUpdate(
		id,
		{ password: hashedPassword },
		{ new: true, runValidators: true }
	);

	if (!user) {
		return next(new HandleError('User not found. Please try again.', 404));
	}

	const newToken = generateToken(user);

	return res.status(200).json({
		success: true,
		data: {
			token: newToken,
			user: {
				nametag: user.nametag,
				email: user.email,
				role: user.role,
				profileImage: user.profileImage,
				prizes: user.prizes,
			},
		},
		message: 'Password changed successfully.',
	});
});
