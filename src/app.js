import express from 'express';
import usersRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use('/user', usersRoutes);

app.listen(3000, () => {
  console.log('listening');
});
