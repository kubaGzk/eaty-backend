import { model, Schema } from 'mongoose';
import { CustomCompositionDoc } from '../util/types';

const ccSchema: Schema = new Schema({
  name: { type: String, require: true },
  size: { type: Schema.Types.ObjectId, ref: 'Size', require: true },
  groups: [
    {
      name: { type: String, require: true },
      minIng: { type: Number, require: true },
      maxIng: { type: Number, require: true },
      maxTotal: { type: Number, require: true },
    },
  ],
  ingredients: [
    {
      ingredient: {
        type: Schema.Types.ObjectId,
        ref: 'Ingredient',
        require: true,
      },
      removable: { type: Boolean, require: true },
      group: { type: String, require: true },
      maxNumber: { type: Number, require: true },
    },
  ],
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
});

export default model<CustomCompositionDoc>('CustomComposition', ccSchema);
