import express from 'express';
import {
	createGame,
	deleteGame,
	getAllGame,
	getGame,
	updateGame,
} from '../Controllers/gameCn.js';
import isAdmin from '../Middlewares/isAdmin.js';

const router = express.Router();

router.route('/').get(getAllGame).post(isAdmin, createGame);

router
	.route('/:id')
	.get(getGame)
	.patch(isAdmin, updateGame)
	.delete(isAdmin, deleteGame);

export default router;
