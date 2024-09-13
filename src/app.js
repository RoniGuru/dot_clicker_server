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

app.listen(port, () => {
  console.log(`listening on port ${port}`);
  console.log(`allowing ${process.env.WEB_URL}`);
  console.log('HOST:', process.env.HOST);
  console.log('USER:', process.env.USER);
  console.log('PASSWORD:', process.env.PASSWORD);
  console.log('DATABASE:', process.env.DATABASE);
  console.log(
    process.env.NODE_ENV === 'production'
      ? process.env.AZURE_MYSQL_PASSWORD
      : process.env.PASSWORD
  );
});
