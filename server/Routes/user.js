import express from 'express';
import {
	deleteUser,
	getAllUser,
	getUser,
	updateUser,
} from '../Controllers/userCn.js';
import isAdmin from './../Middlewares/isAdmin.js';
import isLogin from './../Middlewares/isLogin.js';

const router = express.Router();

router.route('/').get(isAdmin, getAllUser);

router
	.route('/:id')
	.get(isLogin, getUser)
	.patch(isLogin, updateUser)
	.delete(isLogin, deleteUser);

export default router;
