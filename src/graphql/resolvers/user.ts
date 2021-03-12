import { User, UserDoc } from '../../util/types';
import UserModel from '../../models/User';
import { validateLoginInput } from '../../util/validators';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
// import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';

const generateToken = (user: User) =>
  jwt.sign(
    {
      id: user.id,
    },
    process.env.SECRET_KEY!,
    { expiresIn: '1h' },
  );

export default {
  Mutation: {
    login: async (
      _: any,
      args: { username: string; password: string },
    ): Promise<User> => {
      const { username, password } = args;

      const { valid, errors } = validateLoginInput(username, password);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      let user: UserDoc | null;

      try {
        user = await UserModel.findOne(
          { username },
          'username firstname lastname password email role',
        );
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!user) {
        throw new Error('Wrong credentials. U');
      }

      const match = await bcrypt.compare(password, user.password!);

      if (!match) {
        throw new Error('Wrong credentials. P');
      }

      const token = generateToken(user);

      const userObject = { ...user.toObject({ getters: true }), token };
      delete userObject.password;

      return userObject;
    },
    createUser: async (_: any, args: User, context: any): Promise<string> => {
      //@ts-ignore
      const { firstname, lastname, email, role } = args;

      checkAuth(context);

      // const permission = ac.can(userRole).createAny('USER');

      // if (!permission) {
      //   throw new Error('Not authorized to perform this action.');
      // }
      return 'abc';
    },
  },
};
