import express from 'express';
import upload from '../Utils/UploadFile.js';
import isAdmin from '../Middleware/isAdmin.js';
import isLogin from '../Middleware/isLogin.js';
import { deleteFile, uploadFile } from '../Controllers/uploadCn.js';

const router = express.Router();

router
	.route('/')
	.post(isLogin, upload.single('file'), uploadFile) //TODO why dont mark by VSCode
	.delete(isAdmin(['admin']), deleteFile);

export default router;
