import ItemModel from '../../models/Item';
import ac from '../../models/UserRoles';
import checkAuth from '../../util/check-auth';
import {
  categoryCheck,
  customCompositionRulesCheck,
  customCompositionCheck,
  ingredientsCheck,
  priceSizeCheck,
  sizeCheck,
  itemCheck,
} from '../../util/util-func';
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
        ingredients: { ingredient: string; number: number }[];
        itemOptions: {
          mandatory: boolean;
          name: string;
          values: { value: string; priceChange: number }[];
        }[];
        availableSides?: string[];
        customComposition: string;
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

      const itemObj: {
        name: string;
        description?: string;
        noInheritFromCategory: boolean;
        category?: string;
        size?: string;
        basePrice?: { size: string; price: number }[];
        ingredients?: { ingredient: string; number: number }[];
        itemOptions?: {
          mandatory: boolean;
          name: string;
          values: { value: string; priceChange: number }[];
        }[];
        customComposition?: string;
        availableSides?: string[];
      } = { name, noInheritFromCategory: !!noInheritFromCategory };

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

      //CATEGORY CHECK
      const catObj = await categoryCheck(category);

      itemObj.category = catObj.id;

      let customCompObj;
      let sizeObj;

      if (noInheritFromCategory) {
        //NON INHERITED FLOW

        if (customComposition) {
          //CUSTOM COMPOSITION ITEM

          customCompObj = await customCompositionCheck(customComposition);

          await customCompositionRulesCheck(customCompObj, ingredients, true);

          sizeObj = await sizeCheck(customCompObj.size.toString());

          itemObj.ingredients = ingredients;
          itemObj.customComposition = customCompObj.id;
          itemObj.size = sizeObj.id;
        } else if (size) {
          //NON CUSTOM COMPOSITION ITEM

          await ingredientsCheck(ingredients, size);

          sizeObj = await sizeCheck(size);

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

        priceSizeCheck(basePrice, sizeObj);
        itemObj.basePrice = basePrice;
      } else {
        //INHERITED FLOW

        if (catObj.customComposition) {
          //INHERITED CUSTOM COMPOSITION

          customCompObj = await customCompositionCheck(
            catObj.customComposition.toString(),
          );

          const ings: { ingredient: string; number: number }[] = [
            ...ingredients,
          ];

          for (const catIng of catObj.baseIngredients!) {
            ings.push({
              ingredient: catIng.ingredient.toString(),
              number: parseInt(catIng.number.toString()),
            });
          }

          await customCompositionRulesCheck(customCompObj, ings, true);

          sizeObj = await sizeCheck(customCompObj.size.toString());

          itemObj.ingredients = ingredients;
          itemObj.customComposition = customCompObj.id;
          itemObj.size = sizeObj.id;
        } else {
          //INHERITED SIZE

          await ingredientsCheck(ingredients, catObj.size.toString());

          sizeObj = await sizeCheck(catObj.size.toString());

          itemObj.ingredients = ingredients;
          itemObj.size = sizeObj.id as string;
        }

        if (basePrice) {
          priceSizeCheck(basePrice, sizeObj);
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
        for (const side of availableSides) {
          await itemCheck(side);
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
        if (customCompObj) {
          const newCCItems = [];
          for (const it of customCompObj?.items!) {
            newCCItems.push(it.toString());
          }

          customCompObj.items = [...newCCItems, item.id];
          await customCompObj.save({ session: sess });
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
