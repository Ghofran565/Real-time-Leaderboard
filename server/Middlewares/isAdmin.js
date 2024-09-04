import jwt from 'jsonwebtoken';
import catchAsync from '../Utils/catchAsync.js';
import HandleError from '../Utils/handleError.js';

const isAdmin = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(
			new HandleError(
				"Oops! No token found. Please send a token so we can verify if you're logged in.",
				401
			)
		);
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const { role } = decoded;

	if (role !== 'admin') {
		return next(new HandleError('Invalid route', 404)); //puting non-admin user in thr way to catch 404 err
	}

	//req.decodedToken = decoded; //!maybe you don't need this
	return next();
});

export default isAdmin;
