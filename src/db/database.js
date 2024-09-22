import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.AZURE_MYSQL_HOST,
  user: process.env.AZURE_MYSQL_USER,
  password: process.env.AZURE_MYSQL_PASSWORD,
  database: process.env.AZURE_MYSQL_DATABASE,
  port: process.env.AZURE_MYSQL_PORT,
  ssl: {
    rejectUnauthorized: true, // Ensure SSL verification
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 3,
});

export async function createUserDB(username, hashedPassword) {
  try {
    const [results] = await pool.query(
      'Insert into users (username, password) values (?,?)',
      [username, hashedPassword]
    );

    if (results.affectedRows > 0) {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      console.log('User Created ');
      return rows[0];
    } else {
      console.log('Failed to create User');
      return false;
    }
  } catch (error) {
    console.log('Error creating  user:', error);
    return false;
  }
}

export async function getUserDB(username) {
  try {
    const result = await pool.query('Select * from users where username = ?', [
      username,
    ]);

    return result[0][0];
  } catch (error) {
    console.log('Error getting user:', error);
    return false;
  }
}

export async function updateUserUserNameDB(username, userId) {
  try {
    const [results] = await pool.query(
      'update users set username = ? where id = ?',
      [username, userId]
    );

    if (results.affectedRows > 0) {
      console.log('user  name updated ');
      return true;
    } else {
      console.log('Failed to update user');
      return false;
    }
  } catch (error) {
    console.log('Error updating user:', error);
    return false;
  }
}

export async function updateUserPasswordDB(newPassword, userId) {
  try {
    const [results] = await pool.query(
      'update users set password = ? where id = ?',
      [newPassword, userId]
    );

    if (results.affectedRows > 0) {
      console.log('user  password updated ');
      return true;
    } else {
      console.log('Failed to update user password');
      return false;
    }
  } catch (error) {
    console.log('Error updating user:', error);
    return false;
  }
}

export async function updateUserHighScoreDB(score, userId) {
  try {
    const [results] = await pool.query(
      'update users set high_score = ? where id = ?',
      [score, userId]
    );

    if (results.affectedRows > 0) {
      console.log('score  updated ');
      return true;
    } else {
      console.log('Failed to user score');
      return false;
    }
  } catch (error) {
    console.log('Error updating user score', error);
    return false;
  }
}

export async function deleteUserDB(userId) {
  try {
    const [results] = await pool.query('delete from  users  where id = ?', [
      userId,
    ]);

    if (results.affectedRows > 0) {
      console.log('User deleted successfully');
      return true;
    } else {
      console.log('User not found or already deleted');
      return false;
    }
  } catch (error) {
    console.log('Error deleting user:', error);
    return false;
  }
}

export async function insertRefreshTokenDB(refreshToken, userId) {
  try {
    const [results] = await pool.query(
      'Insert into refresh_token ( user_id, refresh_token, expires_at) values (?,?,DATE_ADD(NOW(), INTERVAL 30 DAY))',
      [userId, refreshToken]
    );

    if (results.affectedRows > 0) {
      console.log('Token inserted ');
      return true;
    } else {
      console.log('Failed to insert token');
      return false;
    }
  } catch (error) {
    console.log('Error inserting token:', error);
    return false;
  }
}

export async function clearRefreshTokenDB(userId) {
  try {
    const [tokenResult] = await pool.query(
      'UPDATE refresh_token SET refresh_token = "", expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE user_id = ?',
      [userId]
    );

    if (tokenResult.affectedRows > 0) {
      console.log('Token cleared ');
      return true;
    } else {
      console.log('Failed to clear token');
      return false;
    }
  } catch (error) {
    console.log('Error clearing token:', error);
    return false;
  }
}

export async function updateRefreshTokenDB(refreshToken, userId) {
  try {
    const [results] = await pool.query(
      'UPDATE refresh_token SET refresh_token = ?, expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE user_id = ?',
      [refreshToken, userId]
    );
    if (results.affectedRows > 0) {
      console.log('Token refreshed ');
      return true;
    } else {
      console.log('Failed to refresh token');
      return false;
    }
  } catch (error) {
    console.log('Error updating token:', error);
    return false;
  }
}

export async function getRefreshTokenDB(userId) {
  try {
    const [result] = await pool.query(
      'Select * from refresh_token  where user_id = ?',
      [userId]
    );

    if (result[0]) {
      console.log('token found ');
      return result[0];
    } else {
      console.log('Failed to get token');
      return false;
    }
  } catch (error) {
    console.log('Error getting token:', error);
    return false;
  }
}

export async function getLeaderBoardDB() {
  try {
    const [result] = await pool.query(
      'Select username, high_score from users order by high_score desc limit 5'
    );

    if (result[0]) {
      return result;
    } else {
      console.log('Failed to get top 5');
      return false;
    }
  } catch (error) {
    console.log('Error getting top 5:', error);
    return false;
  }
}
