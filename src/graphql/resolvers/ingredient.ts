import { Ingredient, IngredientDoc } from '../../util/types';
import IngredientModel from '../../models/Ingredient';
import { validateIngredientInput } from '../../util/validators';
import checkAuth from '../../util/check-auth';
import ac from '../../models/UserRoles';
import { sizeCheck } from '../../util/util-func';

export default {
  Query: {
    getIngredient: async (
      _: any,
      args: { id: string },
      context: any,
    ): Promise<Ingredient> => {
      const { id } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).readAny('INGREDIENT');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      let returnedIng;

      try {
        returnedIng = await IngredientModel.findById(id)
          .populate('size')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedIng) {
        throw new Error('Could not find Ingredient for provided ID.');
      }

      return returnedIng.toObject({ getters: true });
    },
    getIngredients: async (
      _: any,
      args: { name?: string; sizeId?: string },
      context: any,
    ): Promise<Ingredient[]> => {
      const { name, sizeId } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).readAny('INGREDIENT');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      const filterObj: { name?: any; size?: string } = {};

      if (name) filterObj.name = { $text: name };
      if (sizeId) filterObj.size = sizeId;

      let returnedIngs;

      try {
        returnedIngs = await IngredientModel.find(filterObj)
          .populate('size')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return returnedIngs.map((ing) => ing.toObject({ getters: true }));
    },
  },
  Mutation: {
    createIngredient: async (
      _: any,
      args: {
        name: string;
        size: string;
        uniqueName: string;
        price: { size: string; price: string }[];
      },
      context: any,
    ): Promise<Ingredient> => {
      const { name, size, uniqueName, price } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).createAny('INGREDIENT');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      const { valid, errors } = validateIngredientInput(name, uniqueName);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      const sizeObj = await sizeCheck(size);
      let existingIng;

      try {
        existingIng = await IngredientModel.findOne({ uniqueName });
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (existingIng) {
        throw new Error('Unique name of ingredient is already used.');
      }

      const priceSizeCheck = price.reduce(
        (acc, prc) => {
          return acc.filter((val) => val !== prc.size);
        },
        [...sizeObj.toObject().values],
      );

      if (priceSizeCheck.length > 0) {
        throw new Error(
          `Following sizes were not provided: ${priceSizeCheck.join('')}`,
        );
      }

      const ingredient = new IngredientModel({ name, size, uniqueName, price });
      let returnedIngredient: IngredientDoc | null;

      try {
        await ingredient.save();
        returnedIngredient = await IngredientModel.findById(ingredient.id)
          .populate('size')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedIngredient) {
        throw new Error('Could not find saved Ingredient.');
      }

      return returnedIngredient.toObject({ getters: true });
    },
    updateIngredient: async () => {},
    deleteIngredient: async () => {},
  },
};
