import { EmailType, UserDoc, User } from '../../util/types';
import UserModel from '../../models/User';
import {
  validateCreateUserInput,
  validateLoginInput,
  validateRegisterInput,
  validatePasswordInput,
} from '../../util/validators';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import sendEmail from '../../util/mailer';
import { generateToken, generateLonglifeToken } from '../../util/token';

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
        throw new Error('Invalid credentials.');
      }

      if (!user.password || user.password.length === 0) {
        throw new Error(
          'User has not been activated, please complete registration process.',
        );
      }

      const match = await bcrypt.compare(password, user.password!);

      if (!match) {
        throw new Error('Invalid credentials.');
      }

      const token = generateToken(user);

      const userObject = { ...user.toObject({ getters: true }), token };
      delete userObject.password;

      return userObject;
    },
    createUser: async (_: any, args: User, context: any): Promise<String> => {
      //@ts-ignore
      const { firstname, lastname, email, role } = args;

      const { valid, errors } = validateCreateUserInput(
        firstname,
        lastname,
        email,
      );

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).createAny('USER');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      let user = new UserModel({
        firstname,
        lastname,
        email,
        role,
      });

      try {
        await user.save();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      const token = generateLonglifeToken(user);

      try {
        await sendEmail(email, 'Inviation to Eaty platform', EmailType.invite, {
          firstname,
          url: token,
        });

        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: { invitation: await bcrypt.hash(token, 12) },
          },
        );
      } catch (err) {
        throw new Error(
          `User has been created. Invitation could not be sent. Error message: ${err}`,
        );
      }

      return `Invitation has been sent to following email address: ${email}`;
    },
    register: async (
      _: any,
      args: { token: string; username: string; password: string },
    ): Promise<string> => {
      const { token, username, password } = args;

      const { valid, errors } = validateRegisterInput(username, password);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      let decodedToken: any;

      try {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY!);
      } catch (err) {
        throw new Error(err);
      }

      let user: UserDoc | null;
      let existingUser: UserDoc | null;

      try {
        existingUser = await UserModel.findOne(
          { username: username },
          'username',
        ).exec();

        user = await UserModel.findById(decodedToken.id!, 'invitation').exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (existingUser) {
        throw new Error('User with provided username already exist.');
      }

      if (!user || !user.invitation || user?.invitation?.length < 1) {
        throw new Error(`Invalid credentials.`);
      }

      const match = await bcrypt.compare(token, user.invitation!);

      if (!match) {
        throw new Error('Invalid credentials.');
      }

      try {
        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: {
              username: username,
              password: await bcrypt.hash(password, 12),
            },
            $unset: { invitation: '' },
          },
        );
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return 'Registration process has been completed.';
    },

    passwordReset: async (
      _: any,
      args: { username: string; email: string },
    ): Promise<string> => {
      const { username, email } = args;

      let user: UserDoc | null;

      try {
        user = await UserModel.findOne(
          { username, email },
          'username email firstname',
        ).exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!user) {
        throw new Error(
          'User with provided username and email does not exist.',
        );
      }

      const token = generateToken(user);

      try {
        await sendEmail(email, 'Password reset', EmailType.reset, {
          firstname: user.firstname,
          url: token,
        });

        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: { resetPassword: await bcrypt.hash(token, 12) },
          },
        );
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return 'Password reset link has been sent to your email address. Link is valid for one hour.';
    },
    completePasswordReset: async (
      _: any,
      args: { token: string; password: string },
    ): Promise<string> => {
      const { token, password } = args;

      const { valid, errors } = validatePasswordInput(password);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      let decodedToken: any;

      try {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY!);
      } catch (err) {
        throw new Error(err);
      }

      let user: UserDoc | null;

      try {
        user = await UserModel.findById(
          decodedToken.id!,
          'resetPassword password',
        ).exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!user || !user.resetPassword || user?.resetPassword?.length < 1) {
        throw new Error(`Invalid credentials.`);
      }

      const match = await bcrypt.compare(token, user.resetPassword!);

      if (!match) {
        throw new Error('Invalid credentials.');
      }

      try {
        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: { password: await bcrypt.hash(password, 12) },
            $unset: { resetPassword: '' },
          },
        );
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return 'Password reset process has been completed.';
    },
  },
};
