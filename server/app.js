/// required imports \\\
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';

/// custom imports \\\

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

/// required app uses \\\
const app = express();
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors()); //fill with front local path

/// custom app uses \\\


app.use('*', (req, res, next) => {
	return next(new HandleError('Invalid route', 404));
});

/// catching every error automaticly \\\
app.use(catchError);

export default app;
