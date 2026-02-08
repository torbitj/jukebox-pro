import { createUser } from '#db/queries/users';
import express from 'express';

const usersRouter = express.Router();
export default usersRouter;

usersRouter.use((req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("Body must include username and password");
  const user = { username, password };
  req.user = user;
  next();
})

usersRouter.post('/register', async(req, res, next) => {
  const { user } = req;
  const newUserToken = await createUser(user)
  res.status(201).send(newUserToken)
})