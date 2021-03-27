import { model, Schema } from 'mongoose';
import { UserDoc } from '../util/types';

const userSchema: Schema = new Schema({
  username: { type: String },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String },
  email: { type: String, required: true },
  role: [
    {
      type: String,
      enum: ['ADMIN', 'PICKER', 'REPORT', 'DRIVER'],
      require: true,
    },
  ],
  resetPassword: String,
  invitation: String,
});

export default model<UserDoc>('User', userSchema);
