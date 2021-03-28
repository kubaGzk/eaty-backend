import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import { CustomComposition, CustomCompositionDoc } from '../../util/types';
import SizeModel from '../../models/Size';
import IngredientModel from '../../models/Ingredient';
import CustomCompositionModel from '../../models/CustomComposition';
import { validateCustomCompositionInput } from '../../util/validators';

export default {
  Query: {
    getCustomComposition: async () => {},
    getCustomCompositions: async () => {},
  },
  Mutation: {
    createCustomComposition: async (
      _: any,
      args: {
        name: string;
        groups: string[];
        size: string;
        ingredients: {
          ingredient: string;
          removable: boolean;
          group: string;
          maxNumber: number;
        }[];
      },
      context: any,
    ): Promise<CustomComposition> => {
      const { name, groups, size, ingredients } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).createAny('COMPOSITION');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      const { valid, errors } = validateCustomCompositionInput(name, groups);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      let sizeObj;

      try {
        sizeObj = await SizeModel.findById(size).exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!sizeObj) {
        throw new Error('Could not find provided size.');
      }

      for (const ing of ingredients) {
        if (groups.indexOf(ing.group) < 0) {
          throw new Error('One of the ingredients has incorrect group.');
        }

        if (ing.maxNumber < 1) {
          throw new Error(
            'One of the ingredients has maximum number less than one.',
          );
        }

        let existIng;
        try {
          existIng = await IngredientModel.findById(ing.ingredient).exec();
        } catch (err) {
          throw new Error(`Unexpected error. ${err}`);
        }

        if (!existIng) {
          throw new Error('One of the ingredients could not be found.');
        }

        if (existIng.size.toString() !== size) {
          throw new Error(
            'One of the ingredients is using different Size than Custom Composition.',
          );
        }
      }

      const customComposition = new CustomCompositionModel({
        name,
        size,
        groups,
        ingredients,
      });

      let returnedCC: CustomCompositionDoc | null;

      try {
        await customComposition.save();
        returnedCC = await CustomCompositionModel.findById(customComposition.id)
          .populate('ingredients.ingredient')
          .populate('size')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. `);
      }

      if (!returnedCC) {
        throw new Error('Could not find saved Custom Composition.');
      }

      return returnedCC.toObject({ getters: true });
    },
  },
};
