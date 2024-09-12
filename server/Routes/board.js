import express from 'express';
import { test } from './../Controllers/boardCn';

const router = express.Router();

router.route('/').get(test);

export default router;
