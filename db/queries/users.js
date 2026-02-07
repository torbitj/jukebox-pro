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

export const userLogin = async ({username, password}) => {
  
}