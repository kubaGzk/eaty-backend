import { startSession } from 'mongoose';
import CategoryModel from '../../models/Category';
import CustomCompositionModel from '../../models/CustomComposition';
import IngredientModel from '../../models/Ingredient';
import SizeModel from '../../models/Size';
import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import { Category, CategoryDoc, Option } from '../../util/types';
import { sizeCheck } from '../../util/util-func';
import { validateCategoryInput } from '../../util/validators';

export default {
  Query: {
    getCategory: async () => {},
    getCategories: async () => {},
  },
  Mutation: {
    createCategory: async (
      _: any,
      args: {
        name: string;
        customComposition?: string;
        size?: string;
        basePrice?: { size: string; price: number }[];
        baseIngredients?: string[];
        options?: Option[];
        availableSides?: string[];
      },
      context: any,
    ): Promise<Category> => {
      const {
        name,
        customComposition,
        size,
        basePrice,
        baseIngredients,
        options,
        availableSides,
      } = args;

      const catObj: {
        name: string;
        customComposition?: string;
        size?: string;
        baseIngredients?: string[];
        basePrice?: { size: string; price: number }[];
        options?: Option[];
        availableSides?: string[];
      } = { name };

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).createAny('CATEGORY');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      const { valid, errors } = validateCategoryInput(name, options);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      let sizeObj;
      let customComp;

      if (customComposition) {
        try {
          customComp = await CustomCompositionModel.findById(
            customComposition,
          ).exec();
        } catch (err) {
          throw new Error(`Unexpected error. ${err}`);
        }

        if (!customComp) {
          throw new Error('Could not find Custom Composition for provided ID.');
        }

        try {
          sizeObj = await SizeModel.findById(customComp.size).exec();
        } catch (err) {
          throw new Error(`Unexpected error. ${err}`);
        }

        catObj.customComposition = customComp.id;
        catObj.size = customComp.size as string;
      } else if (size) {
        try {
          sizeObj = await SizeModel.findById(size).exec();
        } catch (err) {
          throw new Error(`Unexpected error. ${err}`);
        }
      } else {
        throw new Error('Please specify either Custom Composition or Size.');
      }

      if (!sizeObj) {
        throw new Error('Could not find Size for provided ID.');
      }
      catObj.size = sizeObj.id;

      if (basePrice) {
        sizeCheck(basePrice, sizeObj);

        catObj.basePrice = basePrice;
      }

      if (baseIngredients) {
        for (const ing of baseIngredients) {
          let ingObj;
          try {
            ingObj = await IngredientModel.findById(ing).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!ingObj) {
            throw new Error('One of the base ingredients could not be found.');
          }

          if (ingObj.size.toString() !== catObj.size) {
            throw new Error(
              'One of the base ingredients has different Size type.',
            );
          }
        }

        catObj.baseIngredients = baseIngredients;
      }

      if (options) {
        catObj.options = options;
      }

      if (availableSides) {
        for (const side of availableSides) {
          let sideObj;
          try {
            sideObj = await IngredientModel.findById(side).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!sideObj) {
            throw new Error('One of the sides could not be found.');
          }
        }

        catObj.availableSides = availableSides;
      }

      const category = new CategoryModel(catObj);
      let returnedCat: CategoryDoc | null;
      try {
        const sess = await startSession();
        sess.startTransaction();

        await category.save({ session: sess });

        if (customComp) {
          const newCats = [];
          for (const cat of customComp?.categories!) {
            newCats.push(cat.toString());
          }

          customComp.items = [...newCats, category.id];
          await customComp.save({ session: sess });
        }

        await sess.commitTransaction();

        returnedCat = await CategoryModel.findById(category.id)
          .populate('size')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedCat) {
        throw new Error('Could not find saved Ingredient.');
      }

      return returnedCat.toObject({ getters: true });
    },
    updateCategory: async () => {},
    deleteCategory: async () => {},
  },
};
