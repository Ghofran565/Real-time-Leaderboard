import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';
import fs from 'fs';
import { __dirname } from '../app.js';

export const uploadFile = catchAsync(async (req, res, next) => {
	const file = req.file;

	if (!file) {
		return next(new HandleError("You haven't uploaded any file. Please upload one.", 400));
	}

	res.status(200).json({
		success: true,
		data: file,
		message: 'File uploaded successfully.',
	});
});

export const deleteFile = catchAsync(async (req, res, next) => {
	const { fileName } = req.body;
	const deleteFileName = fileName.split('/').at(-1);

	if (deleteFileName === '*') {
		return next(new HandleError("Nice try, but you cannot delete everything in this folder.", 403));
	}

	if (!fileName) {
		return next(new HandleError("File doesn't exist.", 404));
	}

	fs.unlinkSync(`${__dirname}/public/${deleteFileName}`);

	res.status(200).json({
		success: true,
		message: 'File deleted successfully.',
	});
});
