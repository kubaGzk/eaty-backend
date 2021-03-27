import { model, Schema } from 'mongoose';
import { IngredientDoc } from '../util/types';

const ingredientSchema: Schema = new Schema({
  name: { type: String, require: true },
  uniqueName: { type: String, require: true },
  price: [
    {
      size: { type: String, require: true },
      price: { type: Number, require: true },
    },
  ],
  size: { type: Schema.Types.ObjectId, ref: 'Size', require: true },
});

export default model<IngredientDoc>('Ingredient', ingredientSchema);
