import express from 'express';
import {
	auth,
	changePassword,
	checkForgetPassword,
	forgetPassword,
	register,
	sendingEmailCode,
	verifyingEmailCode,
} from '../Controllers/authCn.js';
import isLogin from '../Middlewares/isLogin.js';

const router = express.Router();

router.route('/auth').post(auth);
router.route('/register').post(register);
router.route('/send-code').post(sendingEmailCode);
router.route('/verify-code').post(verifyingEmailCode);
router.route('/forget-password').post(forgetPassword);
router.route('/forget-password-check').post(checkForgetPassword);
router.route('/change-password').patch(isLogin, changePassword);

export default router;
