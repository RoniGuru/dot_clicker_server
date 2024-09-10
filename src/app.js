import express from 'express';
import usersRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());

const corsOptions = {
  origin: process.env.WEB_URL,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use('/user', usersRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
