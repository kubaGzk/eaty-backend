import { startSession } from 'mongoose';
import CategoryModel from '../../models/Category';
import CustomCompositionModel from '../../models/CustomComposition';
import IngredientModel from '../../models/Ingredient';
import ItemModel from '../../models/Item';
import SizeModel from '../../models/Size';
import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import { Category, Option } from '../../util/types';
import {
  customCompositionCheck,
  customCompositionRulesCheck,
  ingredientsCheck,
  itemCheck,
  priceSizeCheck,
  sizeCheck,
} from '../../util/util-func';
import { validateCategoryInput } from '../../util/validators';

export default {
  Category: {
    size: async (parent: Category) => {
      let size = null;

      if (parent.size) {
        try {
          size = await SizeModel.findById(parent.size).exec();
        } catch (err) {
          throw new Error(`Unexpected error. ${err}`);
        }
      }

      return size;
    },

    baseIngredients: async (parent: Category) => {
      let baseIngredients = [];

      if (parent.baseIngredients) {
        for (const ing of parent.baseIngredients) {
          let foundIng;
          try {
            foundIng = await IngredientModel.findById(ing.ingredient).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (foundIng) {
            baseIngredients.push({ ingredient: foundIng, number: ing.number });
          } else {
            return null;
          }
        }
      } else {
        return null;
      }

      return baseIngredients;
    },
    availableSides: async (parent: Category) => {
      let availableSides = [];

      if (parent.availableSides) {
        for (const side of parent.availableSides) {
          let foundSide;
          try {
            foundSide = await ItemModel.findById(side).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (foundSide) {
            availableSides.push(foundSide);
          } else {
            return null;
          }
        }
      } else {
        return null;
      }

      return availableSides;
    },
    customComposition: async (parent: Category) => {
      let customComposition = null;

      if (parent.customComposition) {
        try {
          customComposition = await CustomCompositionModel.findById(
            parent.customComposition,
          ).exec();
        } catch (err) {
          throw new Error(`Unexpected error. ${err}`);
        }
      }
      return customComposition;
    },
    items: async (parent: Category) => {
      let items = [];

      if (parent.items) {
        for (const item of parent.items) {
          let foundItem;
          try {
            foundItem = await ItemModel.findById(item).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (foundItem) {
            items.push(foundItem);
          } else {
            return null;
          }
        }
      } else {
        return null;
      }

      return items;
    },
  },
  Query: {
    getCategory: async (
      _: any,
      args: { id: string },
      context: any,
    ): Promise<Category> => {
      const { id } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).readAny('CATEGORY');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      let returnedCat;

      try {
        returnedCat = await CategoryModel.findById(id).exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedCat) {
        throw new Error('Could not find Category for provided ID.');
      }

      return returnedCat.toObject({ getters: true });
    },
    getCategories: async (
      _: any,
      __: any,
      context: any,
    ): Promise<Category[]> => {
      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).readAny('CATEGORY');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      let returnedCats;

      try {
        returnedCats = await CategoryModel.find().exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return returnedCats.map((cat) => cat.toObject({ getters: true }));
    },
  },
  Mutation: {
    createCategory: async (
      _: any,
      args: {
        name: string;
        customComposition?: string;
        size?: string;
        basePrice?: { size: string; price: number }[];
        baseIngredients?: { ingredient: string; number: number }[];
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
        baseIngredients?: { ingredient: string; number: number }[];
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
      let customCompObj;

      if (customComposition) {
        //CUSTOM COMPOSITION FLOW
        customCompObj = await customCompositionCheck(customComposition);

        if (baseIngredients) {
          customCompositionRulesCheck(customCompObj, baseIngredients);
          catObj.baseIngredients = baseIngredients;
        }
        sizeObj = await sizeCheck(customCompObj.size.toString());

        catObj.customComposition = customCompObj.id;
        catObj.size = sizeObj.id;
      } else if (size) {
        //NON CUSTOM COMPOSITION FLOW
        sizeObj = await sizeCheck(size);
        catObj.size = sizeObj.id;

        if (baseIngredients) {
          await ingredientsCheck(baseIngredients, size);
          catObj.baseIngredients = baseIngredients;
        }
      } else {
        throw new Error('Please specify either Custom Composition or Size.');
      }

      if (basePrice) {
        priceSizeCheck(basePrice, sizeObj!);
        catObj.basePrice = basePrice;
      }

      if (options) {
        catObj.options = options;
      }

      if (availableSides) {
        for (const side of availableSides) {
          await itemCheck(side);
        }

        catObj.availableSides = availableSides;
      }

      const category = new CategoryModel(catObj);

      try {
        const sess = await startSession();
        sess.startTransaction();

        await category.save({ session: sess });

        if (customCompObj) {
          const newCats = [];
          for (const cat of customCompObj?.categories!) {
            newCats.push(cat.toString());
          }

          customCompObj.categories = [...newCats, category.id];
          await customCompObj.save({ session: sess });
        }

        await sess.commitTransaction();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return category.toObject({ getters: true });
    },
    updateCategory: async () => {},
    deleteCategory: async () => {},
  },
};
