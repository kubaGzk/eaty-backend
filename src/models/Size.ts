import { model, Schema } from 'mongoose';

const sizeSchema = new Schema({
  name: { type: String, require: true },
  values: [{ value: { type: String, require: true } }],
});

export default model('Size', sizeSchema);
