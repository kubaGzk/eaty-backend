import { model, Schema } from 'mongoose';
import { CustomCompositionDoc } from '../util/types';

const ccSchema: Schema = new Schema({
  size: { type: Schema.Types.ObjectId, ref: 'Size' },
  groups: [{ type: String, require: true }],
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
  category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
});

export default model<CustomCompositionDoc>('CustomComposition', ccSchema);
