import { model, Schema } from 'mongoose';

const itemSchema = new Schema({
  name: { type: String, require: true },
  description: { type: String, require: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  noInheritFromCategory: { type: Boolean, require: true },
  size: { type: Schema.Types.ObjectId, ref: 'Size' },
  basePrice: [
    {
      size: { type: String, require: true },
      price: { type: Number, require: true },
    },
  ],
  ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
  itemOptions: [
    {
      mandatory: { type: Boolean, require: true },
      name: { type: String, require: true },
      values: [
        {
          value: String,
          priceChange: Number,
        },
      ],
    },
  ],
  availableSides: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  customComposition: { type: Schema.Types.ObjectId, ref: 'CustomComposition' },
});

export default model('Item', itemSchema);
