import {
  getUserDB,
  createUserDB,
  updateUserUserNameDB,
  deleteUserDB,
  getRefreshTokenDB,
  insertRefreshTokenDB,
  updateRefreshTokenDB,
  clearRefreshTokenDB,
  updateUserHighScoreDB,
  updateUserPasswordDB,
  getLeaderBoardDB,
} from '../db/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function getUser(req, res) {
  const user = await getUserDB(req.body.name);
  if (!user) return res.status(404).send('username does not exist');

  return res.json({ id: user.id, username: user.username });
}

export async function login(req, res) {
  try {
    const user = await getUserDB(req.body.name);
    if (!user) return res.status(404).send('username does not exist');

    const compare = await bcrypt.compare(req.body.password, user.password);
    if (!compare) return res.status(404).send('password incorrect');
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

    const compare = await bcrypt.compare(req.body.password, user.password);
    if (!compare) return res.status(401).send('password incorrect');

    const result = await deleteUserDB(user.id);

    result
      ? res.status(200).json('user deleted')
      : res.status(404).json('user not found');
  } catch (error) {
    console.log('Error deleting user:', error);
    res.status(500).send(error);
  }
}

export async function updateUserName(req, res) {
  try {
    const { id, name, newName, password } = req.body;

    if (!id || !name || !password || !newName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pass = await checkPassword(name, password, res);

    if (!pass) return res.status(401).json('password invalid');

    const result = await updateUserUserNameDB(newName, id);
    result
      ? res.status(200).json('user updated')
      : res.status(404).json('new username not unique');
  } catch (error) {
    console.log('Error updating user name:', error);
    res.status(500).send(error);
  }
}

export async function updateUserPassword(req, res) {
  try {
    const { id, name, password, newPassword } = req.body;

    if (!id || !name || !password || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pass = checkPassword(name, password, res);
    if (!pass) return res.status(401).json('password invalid');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await updateUserPasswordDB(hashedPassword, id);
    result
      ? res.status(200).json('user password updated')
      : res.status(404).json('user not found ');
  } catch (error) {
    console.log('Error updating user password:', error);
    res.status(500).send(error);
  }
}

export async function updateUserScore(req, res) {
  try {
    const result = await updateUserHighScoreDB(req.body.score, req.body.id);
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

export async function getLeaderBoard(req, res) {
  try {
    const result = await getLeaderBoardDB();
    result
      ? res.status(200).json(result)
      : res.status(404).json('top 5 not found');
  } catch (err) {
    console.log('Error getting leaderboard', err);
    res.status(500).send(err);
  }
}

export async function checkPassword(username, password, res) {
  try {
    const user = await getUserDB(username);

    if (!user) return false;

    const compare = await bcrypt.compare(password, user.password);

    if (!compare) return false;

    return true;
  } catch (err) {
    console.log('error checking password', err);
    throw err;
  }
}
