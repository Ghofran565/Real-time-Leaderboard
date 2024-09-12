import express from 'express';
import { addTournament, allCurrentTournament, currentTournament, deleteTournament, getAllTournament, getTournament } from '../Controllers/tournamentCn.js';
import isAdmin from './../Middlewares/isAdmin.js';

const router = express.Router();

router.route('/').get(isAdmin, getAllTournament).post(isAdmin,addTournament);

router.route('/current').get(allCurrentTournament);

router
	.route('/current/:id')
	.get(currentTournament)

router
	.route('/:id')
	.get(isAdmin,getTournament)
	.delete(isAdmin, deleteTournament);

export default router;
