import app from "./app.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { __dirname } from "./app.js";

// import { scheduleActiveTournaments } from './Controllers/tournamentCn.js'; //!have to wait for the "build server" time

dotenv.config({ path: `${__dirname}/config.env` });

//await scheduleActiveTournaments(); //?have to wait for the "build server" time

const port = process.env.PORT;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Database is connected and ready to use"))
  .catch((err) => console.log(err));

app.listen(port, () => console.log(`Server is running on port ${port} :]`));
