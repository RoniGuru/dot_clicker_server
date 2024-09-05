import {
  getUserDB,
  createUserDB,
  updateUserDB,
  deleteUserDB,
  getRefreshTokenDB,
  insertRefreshTokenDB,
  updateRefreshTokenDB,
  clearRefreshTokenDB,
  updateUserHighScoreDB,
} from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function getUser(req, res) {
  console.log(req.body);
  const user = await getUserDB(req.body.name);

  return res.json({ id: user.id, username: user.username });
}

export async function login(req, res) {
  try {
    const user = await getUserDB(req.body.name);
    if (!user) return res.status(404).send('username does not exist');

    const compare = await bcrypt.compare(req.body.password, user.password);
    if (!compare) return res.send('password incorrect');
    const token = generateRefreshToken(user.username);
    //get refresh token
    const refreshToken = await getRefreshTokenDB(user.id);

    console.log('refresh token', refreshToken);
    if (refreshToken) {
      console.log(' token');

      updateRefreshTokenDB(token, user.id);
    } else {
      console.log('no token');
      await insertRefreshTokenDB(token, user.id);
    }

    const accessToken = generateAccessToken(user);
    res.json({
      accessToken: accessToken,
      refreshToken: token,
      user: { id: user.id, name: user.username, score: user.high_score },
    });
  } catch (error) {
    console.log('Error logging in user:', error);
    res.status(500).send(error);
  }
}

export async function logout(req, res) {
  try {
    await clearRefreshTokenDB(req.body.id);

    res.status(200).send('user logged out refresh token ');
  } catch {
    res.status(500).send('error while logging out');
  }
}

export async function createUser(req, res) {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await createUserDB(req.body.name, hashedPassword);

    user
      ? res.status(200).json(user)
      : res.status(500).json('user not created');
  } catch (error) {
    console.log('Error creating user:', error);
    res.status(500).send(error);
  }
}

export async function deleteUser(req, res) {
  try {
    const user = await getUserDB(req.body.name);
    console.log(user);

    const compare = await bcrypt.compare(req.body.password, user.user_password);
    if (!compare) return res.send('password incorrect');

    const result = await deleteUserDB(req.body.id);
    result
      ? res.status(200).json('user deleted')
      : res.status(404).json('user not found');
  } catch (error) {
    console.log('Error deleting user:', error);
    res.status(500).send(error);
  }
}

export async function updateUser(req, res) {
  try {
    const result = await updateUserDB(req.body.name, req.body.id);
    result
      ? res.status(200).json('user updated')
      : res.status(404).json('user not found');
  } catch (error) {
    console.log('Error updating user:', error);
    res.status(500).send(error);
  }
}

export async function updateUserScore(req, res) {
  try {
    const result = await updateUserDB(req.body.score, req.body.id);
    result
      ? res.status(200).json('user score updated')
      : res.status(404).json('user not found');
  } catch (error) {
    console.log('Error updating  user score:', error);
    res.status(500).send(error);
  }
}

export async function getToken(req, res) {
  if (req.body.refreshToken == null) return res.sendStatus(401);
  jwt.verify(
    req.body.refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403).send('invalid refresh token');
      const accessToken = generateAccessToken({ name: user.name });
      res.json({ accessToken: accessToken });
    }
  );
}

export function generateAccessToken(username) {
  return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1hr',
  });
}

export function generateRefreshToken(username) {
  return jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
}
