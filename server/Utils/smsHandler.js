import handleError from './handleError.js';
import catchAsync from '../Utils/catchAsync.js';

export const sendAuthCode = catchAsync(async (Mobile, next) => {
	try {
		const res = await fetch('https://api.limosms.com/api/sendcode', {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
				ApiKey: process.env.SMS_KEY,
			},
			body: JSON.stringify({
				Mobile,
				Footer: 'Unkonwn 1429 _ 1',
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		return next(new handleError('Sending SMS code was unsuccessful', 500));
	}
});

export const verifyCode = catchAsync(async (Mobile, Code, next) => {
	try {
		const res = await fetch('https://api.limosms.com/api/checkcode', {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
				ApiKey: process.env.SMS_KEY,
			},
			body: JSON.stringify({
				Mobile,
				Code,
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		return next(new handleError('Verifying SMS code was unsuccessful', 500));
	}
});
