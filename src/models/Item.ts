import { model, Schema } from 'mongoose';
import { ItemDoc } from '../util/types';

const itemSchema: Schema = new Schema({
  name: { type: String, require: true },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  noInheritFromCategory: { type: Boolean, require: true },
  size: { type: Schema.Types.ObjectId, ref: 'Size' },
  basePrice: [
    {
      size: { type: String, require: true },
      price: { type: Number, require: true },
    },
  ],
  ingredients: [
    {
      ingredient: { type: Schema.Types.ObjectId, ref: 'Ingredient' },
      number: { type: Number },
    },
  ],
  itemOptions: [
    {
      mandatory: { type: Boolean },
      name: { type: String },
      values: [
        {
          value: { type: String },
          priceChange: { type: Number },
        },
      ],
    },
  ],
  availableSides: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  customComposition: { type: Schema.Types.ObjectId, ref: 'CustomComposition' },
});

export default model<ItemDoc>('Item', itemSchema);
