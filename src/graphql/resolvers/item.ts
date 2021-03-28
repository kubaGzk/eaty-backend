import CategoryModel from '../../models/Category';
import CustomCompositionModel from '../../models/CustomComposition';
import IngredientModel from '../../models/Ingredient';
import ItemModel from '../../models/Item';
import SizeModel from '../../models/Size';
import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import { sizeCheck } from '../../util/util-func';
import { validateItemInput } from '../../util/validators';
import { ItemDoc, Item } from '../../util/types';
import { startSession } from 'mongoose';

export default {
  Mutation: {
    createItem: async (
      _: any,
      args: {
        name: string;
        description?: string;
        category: string;
        noInheritFromCategory?: boolean;
        size?: string;
        basePrice?: { size: string; price: number }[];
        ingredients: string[];
        itemOptions: {
          mandatory: boolean;
          name: string;
          values: { value: string; priceChange: number }[];
        }[];
        availableSides?: string[];
        customComposition: string[];
      },
      context: any,
    ): Promise<Item> => {
      const {
        name,
        description,
        category,
        noInheritFromCategory,
        size,
        basePrice,
        ingredients,
        itemOptions,
        availableSides,
        customComposition,
      } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).createAny('ITEM');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      const { valid, errors } = validateItemInput(
        name,
        description,
        itemOptions,
      );

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      const itemObj: {
        name: string;
        description?: string;
        noInheritFromCategory: boolean;
        category?: string;
        size?: string;
        basePrice?: { size: string; price: number }[];
        ingredients?: string[];
        itemOptions?: {
          mandatory: boolean;
          name: string;
          values: { value: string; priceChange: number }[];
        }[];
        customComposition?: string;
        availableSides?: string[];
      } = { name, noInheritFromCategory: !!noInheritFromCategory };

      //CATEGORY CHECK
      let catObj;

      try {
        catObj = await CategoryModel.findById(category).exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!catObj) {
        throw new Error('Could not find category for provided ID.');
      }

      itemObj.category = category;

      let customComp;

      if (noInheritFromCategory) {
        //NON INHERITED FLOW - CUSTOM COMPOSITION OR SIZE BASED
        let sizeObj;

        if (customComposition) {
          //CUSTOM COMPOSITION ITEM

          //CUSTOM COMPOSITION CHECK

          try {
            customComp = await CustomCompositionModel.findById(
              customComposition,
            ).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!customComp) {
            throw new Error(
              'Could not find Custom Composition for provided ID.',
            );
          }

          //INGREDIENT CHECK
          for (const ing of ingredients) {
            let ingObj;
            try {
              ingObj = IngredientModel.findById(ing);
            } catch (err) {
              throw new Error(`Unexpected error. ${err}`);
            }
            if (!ingObj) {
              throw new Error('Could not find one of provided ingredients');
            }

            const ind = customComp.ingredients.findIndex(
              (ccIng) => ccIng.ingredient.toString() === ing,
            );
            if (ind < 0) {
              throw new Error(
                'One of the ingredients is not part of provided Custom Composition.',
              );
            }
          }

          //SIZE CHECK
          try {
            sizeObj = await SizeModel.findById(customComp.size).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!sizeObj) {
            throw new Error('Could not find Size for provided ID.');
          }

          itemObj.ingredients = ingredients;
          itemObj.customComposition = customComp.id;
          itemObj.size = customComp.size as string;
        } else if (size) {
          //NON CUSTOM COMPOSITION ITEM

          //INGREDIENT CHECK
          for (const ing of ingredients) {
            let ingObj;

            try {
              ingObj = await IngredientModel.findById(ing).exec();
            } catch (err) {
              throw new Error(`Unexpected error. ${err}`);
            }

            if (!ingObj) {
              throw new Error('Could not find one of provided ingredients');
            }

            if (ingObj?.size.toString() !== size) {
              throw new Error(
                'One of the ingredients has different Size than provided.',
              );
            }
          }

          //SIZE CHECK
          try {
            sizeObj = await SizeModel.findById(size).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!sizeObj) {
            throw new Error('Could not find Size for provided ID.');
          }

          itemObj.ingredients = ingredients;
          itemObj.size = sizeObj.id as string;
        } else {
          throw new Error('Please specify either Custom Composition or Size.');
        }

        if (!basePrice) {
          throw new Error(
            'Base price for non-inherited items must be provided.',
          );
        }

        sizeCheck(basePrice, sizeObj);
        itemObj.basePrice = basePrice;
      } else {
        //INHERITED FLOW

        //INGREDIENT CHECK
        for (const ing of ingredients) {
          let ingObj;

          try {
            ingObj = await IngredientModel.findById(ing).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!ingObj) {
            throw new Error('Could not find one of provided ingredients');
          }

          if (ingObj?.size.toString() !== catObj.size.toString()) {
            throw new Error(
              'One of the ingredients has different Size than selected Category.',
            );
          }
        }

        //BASE PRICE CHECK CHECK
        if (basePrice) {
          let sizeObj;
          try {
            sizeObj = await SizeModel.findById(catObj.size).exec();
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }

          if (!sizeObj) {
            throw new Error('Could not find Size for provided ID.');
          }

          sizeCheck(basePrice, sizeObj);
          itemObj.basePrice = basePrice;
        } else if (catObj.basePrice?.length! < 1) {
          throw new Error(
            'Base price for this item is required as category does not provide any.',
          );
        }
      }

      //ALL ITEMS PROCESSES

      if (description) {
        itemObj.description = description;
      }

      if (itemOptions) {
        itemObj.itemOptions = itemOptions;
      }

      if (availableSides) {
        let sideObj;
        for (const side of availableSides) {
          try {
            sideObj = ItemModel.findById(side);
          } catch (err) {
            throw new Error(`Unexpected error. ${err}`);
          }
          if (!sideObj) {
            throw new Error('Could not find one of provided side dishes.');
          }
        }

        itemObj.availableSides = availableSides;
      }

      let returnedItem: ItemDoc | null;
      const item = new ItemModel(itemObj);
      try {
        const sess = await startSession();
        sess.startTransaction();

        //SAVE ITEM
        await item.save({ session: sess });

        //SAVE NEW CATEGORY ITEM LIST
        const newCatItems = [];

        for (const it of catObj?.items!) {
          newCatItems.push(it.toString());
        }

        catObj.items = [...newCatItems, item.id];

        await catObj.save({ session: sess });

        //SAVE NEW CUSTOM COMPOSITION ITEM LIST
        if (customComp) {
          const newCCItems = [];
          for (const it of customComp?.items!) {
            newCCItems.push(it.toString());
          }

          customComp.items = [...newCCItems, item.id];
          await customComp.save({ session: sess });
        }

        await sess.commitTransaction();

        returnedItem = await ItemModel.findById(item.id)
          .populate('category')
          .populate('size')
          .populate('ingredients')
          .populate('availableItems')
          .exec();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      if (!returnedItem) {
        throw new Error('Could not find saved Item.');
      }

      return returnedItem.toObject({ getters: true });
    },
  },
};
