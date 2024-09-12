import express from 'express';
import usersRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import cors from 'cors';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config({ path: '.env.development' });
}

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.WEB_URL,
  })
);
app.use('/user', usersRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log(`allowing ${process.env.WEB_URL}`);
});
