import { model, Schema } from 'mongoose';
import { CategoryDoc } from '../util/types';

const categorySchema: Schema = new Schema({
  name: { type: String, require: true },
  size: { type: Schema.Types.ObjectId, ref: 'Size' },
  basePrice: [
    {
      _id: false,
      size: { type: String, require: true },
      price: { type: Number, require: true },
    },
  ],
  baseIngredients: [
    {
      _id: false,
      ingredient: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
      number: { type: Number },
    },
  ],
  options: [
    {
      _id: false,
      mandatory: { type: Boolean },
      multi: { type: Boolean },
      maxSelect: { type: Number },
      name: { type: String },
      values: [
        { _id: false, value: { type: String }, priceChange: { type: Number } },
      ],
    },
  ],
  availableSides: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  customComposition: { type: Schema.Types.ObjectId, ref: 'CustomComposition' },
});

export default model<CategoryDoc>('Category', categorySchema);
