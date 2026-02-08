import db from '#db/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createUser = async ({username, password}) => {
  const sql = `
    INSERT INTO users (username, password)
    VALUES ($1, $2)
    RETURNING username
  `;
  const securePassword = await bcrypt.hash(password, 10);
  const { rows: [user] } = await db.query(sql, [username, securePassword])
  const token = jwt.sign({ user }, process.env.JWT_SECRET);
  return token;
}

export const authenticateUser = async ({username, password}) => {
  const sql = `
    SELECT * FROM users
    WHERE users.username = $1
  `;

  let validPassword = false;
  let token = null;
  const { rows: [user] } = await db.query(sql, [username]);
  if (user) {
    validPassword = await bcrypt.compare(password, user.password);
  } else {
    throw new Error('Invalid username or password.')
  }
  if (validPassword) {
    token = jwt.sign({username}, process.env.JWT_SECRET)
  } else {
    throw new Error('Invalid username or password.')
  }
  return token;
}

export const getUserIdByToken = async (token) => {
  const sql = `
    SELECT * FROM users
    WHERE users.username = $1
  `;
  const validToken = jwt.verify(token, process.env.JWT_SECRET);
  const { rows: [user] } = await db.query(sql, [validToken.username])
  return user.id;
}