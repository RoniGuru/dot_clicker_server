import {
  getUser,
  login,
  createUser,
  deleteUser,
  updateUserName,
  updateUserPassword,
  getToken,
  logout,
  updateUserScore,
  getLeaderBoard,
} from '../controllers/userController.js';
import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/', authenticateToken, getUser);
router.post('/login', login);
router.post('/register', createUser);
router.delete('/delete', authenticateToken, deleteUser);
router.put('/updateName', authenticateToken, updateUserName);
router.put('/updatePassword', authenticateToken, updateUserPassword);
router.put('/updateScore', authenticateToken, updateUserScore);
router.post('/logout', logout);
router.get('/leaderBoard', getLeaderBoard);

router.post('/token', getToken);
export default router;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).send('no token');

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(401);

    req.user = user;
    next();
  });
}
