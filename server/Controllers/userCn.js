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
		return next(new HandleError('Access denied. Invalid user.', 403));
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
	const { id } = req.params;
	const user = await User.findById(id);

	if (!user) {
		return next(new HandleError(`User with ID ${id} not found.`, 404));
	}

	const {
		role: userRole = user.role,
		password: userPass,
		...others
	} = req.body;

	const updatedData = { ...others, role: userRole };

	if (userPass) {
		updatedData.password = bcryptjs.hashSync(userPass, 10);
	}

	const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
		new: true,
		runValidators: true,
	});

	return res.status(200).json({
		success: true,
		message: `User with ID ${id} updated successfully.`,
		data: {
			id: updatedUser._id,
			nametag: updatedUser.nametag,
			email: updatedUser.email,
			role: updatedUser.role,
		},
	});
});

export const deleteUser = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const user = await User.findByIdAndDelete(id);
	if (!user) {
		return next(new HandleError('User not found.', 404));
	}

	await Board.deleteMany({ userId: id });

	return res.status(200).json({
		success: true,
		message: `User with ID ${id} and related data deleted successfully.`,
	});
});
