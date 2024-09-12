import express from 'express';
import { test } from './../Controllers/boardCn.js';

const router = express.Router();

router.route('/').get(test);

export default router;
