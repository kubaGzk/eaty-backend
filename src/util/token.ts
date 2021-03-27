import jwt from 'jsonwebtoken';
import { User } from '../util/types';

const generateToken = (user: User) =>
  jwt.sign(
    {
      id: user.id,
    },
    process.env.SECRET_KEY!,
    { expiresIn: '1h' },
  );

const generateLonglifeToken = (user: User) =>
  jwt.sign(
    {
      id: user.id,
    },
    process.env.SECRET_KEY!,
    { expiresIn: '48h' },
  );

export { generateToken, generateLonglifeToken };
