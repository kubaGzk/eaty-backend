import { model, Schema } from 'mongoose';
import { UserDoc } from '../util/types';

const userSchema: Schema = new Schema({
  username: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: [
    {
      type: String,
      enum: ['ADMIN', 'PICKER', 'REPORT', 'DRIVER'],
      require: true,
    },
  ],
});

export default model<UserDoc>('User', userSchema);
