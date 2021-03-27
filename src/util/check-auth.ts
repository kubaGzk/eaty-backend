import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { User } from '../util/types';
// import { UserType } from './types';
// import UserModel from '../models/User';

export default async (context: any): Promise<User> => {
  const { authorization: authHeader } = context.headers;
  const { authToken } = context;
  try {
    let token: string | undefined;
    if (authHeader) {
      token = authHeader.split(' ')[1];
    } else if (authToken) {
      token = authToken;
    }

    if (token) {
      const decodedToken: any = jwt.verify(token, process.env.SECRET_KEY!);

      const user = await UserModel.findById(
        decodedToken.id,
        'username role email firstname lastname',
      ).exec();
      
      if (!user) {
        throw new Error("Invalid credentials.");
      }

      return user.toObject({ getters: true });
    } else {
      throw new Error('Authentication token was not provided.');
    }
  } catch (err) {
    throw new Error(`Authentication error. ${err}`);
  }
};
