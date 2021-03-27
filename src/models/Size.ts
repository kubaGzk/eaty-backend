import { model, Schema } from 'mongoose';
import { SizeDoc } from '../util/types';

const sizeSchema: Schema = new Schema({
  name: { type: String, require: true },
  values: [{ type: String, require: true }],
});

export default model<SizeDoc>('Size', sizeSchema);
