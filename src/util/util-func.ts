import { CustomCompositionDoc, CategoryDoc, SizeDoc, ItemDoc } from './types';
import IngredientModel from '../models/Ingredient';
import SizeModel from '../models/Size';
import CustomCompositionModel from '../models/CustomComposition';
import CategoryModel from '../models/Category';
import ItemModel from '../models/Item';

export const priceSizeCheck = (
  price: { size: string; price: number }[],
  size: SizeDoc,
): void => {
  const priceSizeCheck = price.reduce(
    (acc, prc) => {
      return acc.filter((val) => val !== prc.size);
    },
    [...size.toObject().values],
  );

  if (priceSizeCheck.length > 0) {
    throw new Error(
      `Following sizes were not provided: ${priceSizeCheck.join('')}`,
    );
  }
};

export const sizeCheck = async (size: string): Promise<SizeDoc> => {
  let sizeObj;

  try {
    sizeObj = await SizeModel.findById(size).exec();
  } catch (err) {
    throw new Error(`Unexpected error. ${err}`);
  }

  if (!sizeObj) {
    throw new Error('Could not find Size for provided ID.');
  }

  return sizeObj;
};

export const ingredientsCheck = async (
  ingredients: {
    ingredient: string;
    number?: number;
    removable?: boolean;
    group?: string;
    maxNumber?: number;
  }[],
  size?: string,
) => {
  for (const ing of ingredients) {
    let ingObj;

    try {
      ingObj = await IngredientModel.findById(ing.ingredient).exec();
    } catch (err) {
      throw new Error(`Unexpected error. ${err}`);
    }

    if (!ingObj) {
      throw new Error('Could not find one of provided ingredients');
    }
    if (size && ingObj?.size.toString() !== size) {
      throw new Error(
        'One of the ingredients has different Size than provided.',
      );
    }
  }
};

export const customCompositionCheck = async (
  customComposition: string,
): Promise<CustomCompositionDoc> => {
  let customCompObj;

  try {
    customCompObj = await CustomCompositionModel.findById(
      customComposition,
    ).exec();
  } catch (err) {
    throw new Error(`Unexpected error. ${err}`);
  }

  if (!customCompObj) {
    throw new Error('Could not find Custom Composition for provided ID.');
  }

  return customCompObj;
};
export const categoryCheck = async (category: string): Promise<CategoryDoc> => {
  let catObj;

  try {
    catObj = await CategoryModel.findById(category).exec();
  } catch (err) {
    throw new Error(`Unexpected error. ${err}`);
  }

  if (!catObj) {
    throw new Error('Could not find category for provided ID.');
  }

  return catObj;
};

export const itemCheck = async (item: string): Promise<ItemDoc> => {
  let itemObj;

  try {
    itemObj = await ItemModel.findById(item);
  } catch (err) {
    throw new Error(`Unexpected error. ${err}`);
  }
  if (!itemObj) {
    throw new Error('Could not find one of provided side dishes.');
  }

  return itemObj;
};

export const customCompositionRulesCheck = async (
  ccObj: CustomCompositionDoc,
  ingredients: { ingredient: string; number: number }[],
  strictCheck?: boolean,
) => {
  //STRICT CHECK ONLY WHEN ITEM OR ORDER IS CREATED

  //CREATE OBJECT THAT COLLECT INFO ABOUT EVERY GROUP RULE
  const groupRules = ccObj.groups.map((gr) => ({
    name: gr.name,
    total: 0,
    ingNumber: 0,
  }));

  //CHECK IF INGREDIENTS ARE IN CUSTOM COMPOSITION AND SUM ALL INGREDIENTS
  for (const ing of ingredients) {
    const ind = ccObj.ingredients.findIndex(
      (ccIng) => ccIng.ingredient.toString() === ing.ingredient,
    );

    if (ind < 0) {
      throw new Error(
        'One of the ingredients is not part of provided Custom Composition.',
      );
    }

    let ingObj;
    try {
      ingObj = await IngredientModel.findById(ing.ingredient);
    } catch (err) {
      throw new Error(`Unexpected error. ${err}`);
    }
    if (!ingObj) {
      throw new Error('Could not find one of provided ingredients');
    }

    if (ing.number < 1) {
      throw new Error('Ingredient cannot have number less than one.');
    }

    const ruleIndex = groupRules.findIndex(
      (gr) => gr.name === ccObj.ingredients[ind].group,
    );

    groupRules[ruleIndex].ingNumber += 1;
    groupRules[ruleIndex].total += ing.number;
  }

  //CHECK SUM RESULT
  for (const group of ccObj.groups) {
    const ruleIndex = groupRules.findIndex((gr) => gr.name === group.name);

    if (strictCheck && groupRules[ruleIndex].ingNumber < group.minIng) {
      throw new Error(
        "One of the ingredients doesn't match minimum requirements.",
      );
    }

    if (groupRules[ruleIndex].ingNumber > group.maxIng) {
      throw new Error(
        "One of the ingredients doesn't match maximum requirements.",
      );
    }
    if (groupRules[ruleIndex].total > group.maxTotal) {
      throw new Error(
        "One of the ingredients doesn't match total maximum requirements.",
      );
    }
  }

  //CHECK IF PROVIDED INGREDIENTS MATCH REQUIREMENTS
  for (const ing of ccObj.ingredients) {
    const ind = ingredients.findIndex(
      (chIng) => chIng.ingredient === ing.ingredient.toString(),
    );
    if (strictCheck && !ing.removable && ind < 0) {
      throw new Error(
        'One of the ingredients that cannot be removed is not provided. Please check required ingredients on Custom Composition.',
      );
    }

    if (ind >= 0 && ingredients[ind].number  > ing.maxNumber ) {
      throw new Error(
        'One of the ingredients number is higher than Custom Composition allows to.',
      );
    }
  }
};
