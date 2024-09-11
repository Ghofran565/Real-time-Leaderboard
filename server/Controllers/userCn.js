import bcryptjs from 'bcryptjs';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import ApiFeatures from '../Utils/apiFeatures.js';
import User from '../Models/userMd.js';
import Board from '../Models/boardMd.js';

export const getAllUser = catchAsync(async (req, res, next) => {
	const userFeatures = new ApiFeatures(User, req.query)
		.filters()
		.sort()
		.limitFields()
		.paginate()
		.populate();
	const users = await userFeatures.query;
	return res.status(200).json({
		success: true,
		data: { users },
	});
});

export const getUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { id: userId, role } = req.decodedToken;
	if (id !== userId && role !== 'admin') {
		return next(new HandleError('Invalid route', 404)); //*puting non-admin user in 404 route
	}
	const user = await User.findById(id).select('-password -__v');
	if (!user) {
		return next(new HandleError(`User with ID ${id} not found.`, 404));
	}
	return res.status(200).json({
		success: true,
		data: { user },
	});
});

export const updateUser = catchAsync(async (req, res, next) => {
	let updatedUser;
	let hashPassword;
	let isPasswordExist = false;

	const { id } = req.params;
	const { id: userId, role: tokenRole } = req.decodedToken;
	const { role: userRole, password: userPassword, ...others } = req.body;

	if (userPassword && !passwordRegex.test(userPassword)) {
		return next(
			new HandleError(
				'Password must be at least 8 characters long and contain at least one letter and one number.',
				400
			)
		);
	} else if (userPassword) {
		hashPassword = bcryptjs.hashSync(userPassword, 10);
		isPasswordExist = true;
	}

	if (tokenRole === 'admin') {
		updatedUser = await User.findByIdAndUpdate(
			id,
			{ role: userRole, usedDiscountCode, ...others },
			{
				new: true,
				runValidators: true,
			}
		).select('-password -__v');

		return res.status(200).json({
			success: true,
			message: `User with ID ${id} updated successfully by admin.`,
			data: { updatedUser },
		});
	} else if (id === userId) {
		if (isPasswordExist) {
			updatedUser = await User.findByIdAndUpdate(
				id,
				{ password: hashPassword, ...others },
				{
					new: true,
					runValidators: true,
				}
			).select('-password -__v');
		} else {
			updatedUser = await User.findByIdAndUpdate(id, others, {
				new: true,
				runValidators: true,
			}).select('-password -__v');
		}
		return res.status(200).json({
			success: true,
			message: `User with ID ${id} updated successfully by user themselves.`,
			data: { updatedUser },
		});
	} else {
		return next(new HandleError('Invalid route', 404)); //*puting non-admin user in 404 route
	}
});

export const deleteUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { id: userId, role: tokenRole } = req.decodedToken;

	if (id !== userId && tokenRole !== 'admin') {
		return next(new HandleError('Invalid route', 404)); //*puting non-admin&&non-self user in 404 route
	}

	const user = await User.findByIdAndDelete(id);
	if (!user) {
		return next(new HandleError('User not found.', 404));
	}

	await Board.updateMany(
		{ 'userData.userId': userId },
		{ $pull: { userData: { userId: userId } } }
	);

	return res.status(200).json({
		success: true,
		message: `User with ID ${id} and related data deleted successfully.`,
	});
});
