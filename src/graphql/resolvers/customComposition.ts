import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import { CustomComposition } from '../../util/types';
import CustomCompositionModel from '../../models/CustomComposition';
import { validateCustomCompositionInput } from '../../util/validators';
import { ingredientsCheck, sizeCheck } from '../../util/util-func';

export default {
  Query: {
    getCustomComposition: async (
      _: any,
      args: { id: string },
      context: any,
    ): Promise<CustomComposition> => {
      const { id } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).readAny('COMPOSITION');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      let returnedCC;
      try {
        returnedCC = await CustomCompositionModel.findById(id)
          .populate('ingredients.ingredient')
          .populate('size')
          .populate('categories')
          .populate('items')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedCC) {
        throw new Error('Could not find Custom Composition for provided ID.');
      }

      return returnedCC.toObject({ getters: true });
    },
    getCustomCompositions: async (
      _: any,
      __: any,
      context: any,
    ): Promise<CustomComposition[]> => {
      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).readAny('COMPOSITION');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      let returnedCCs;
      try {
        returnedCCs = await CustomCompositionModel.find()
        .populate('ingredients.ingredient')
        .populate('size')
        .populate('categories')
        .populate('items')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return returnedCCs.map((cc) => cc.toObject({ getters: true }));
    },
  },
  Mutation: {
    createCustomComposition: async (
      _: any,
      args: {
        name: string;
        groups: {
          name: string;
          minIng: number;
          maxIng: number;
          maxTotal: number;
        }[];
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

      const { valid, errors } = validateCustomCompositionInput(
        name,
        groups.map((gr) => gr.name),
      );

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      await sizeCheck(size);
      await ingredientsCheck(ingredients, size);

      for (const ing of ingredients) {
        if (groups.findIndex((gr) => gr.name === ing.group) < 0) {
          throw new Error('One of the ingredients has incorrect group.');
        }

        if (ing.maxNumber < 1) {
          throw new Error(
            'One of the ingredients has maximum number less than one.',
          );
        }
      }

      const customComposition = new CustomCompositionModel({
        name,
        size,
        groups,
        ingredients,
      });

      let returnedCC;

      try {
        await customComposition.save();
        returnedCC = await CustomCompositionModel.findById(customComposition.id)
          .populate('ingredients.ingredient')
          .populate('size')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedCC) {
        throw new Error('Could not find saved Custom Composition.');
      }

      return returnedCC.toObject({ getters: true });
    },
  },
};
