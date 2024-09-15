import express from 'express';
import usersRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.WEB_URL,
  })
);
app.use('/user', usersRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {});
