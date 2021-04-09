import ingredientResolvers from './ingredient';
import sizeResolvers from './size';
import userResolvers from './user';
import categoryResolvers from './category';
import customCompositionResolvers from './customComposition';
import itemResolvers from './item';

export default {
  Item: {
    price: (parent: any) => {
      const {
        noInheritFromCategory,
        basePrice,
        ingredients,
        category: { baseIngredients },
      } = parent;

      const returnedPrice: { size: string; price: number }[] = [];

      //BASE PRICE
      for (const bP of basePrice!) {
        returnedPrice.push({ size: bP.size, price: bP.price });
      }

      //INGREDIENTS
      for (const ing of ingredients) {
        for (const prc of ing.ingredient.price) {
          const ind = returnedPrice.findIndex((p) => p.size === prc.size);
          returnedPrice[ind].price += ing.number * prc.price;
        }
      }

      //CATEGORY BASE INGREDIENTS
      if (!noInheritFromCategory) {
        for (const ing of baseIngredients) {
          for (const prc of ing.ingredient.price) {
            const ind = returnedPrice.findIndex((p) => p.size === prc.size);
            returnedPrice[ind].price += ing.number * prc.price;
          }
        }
      }

      return returnedPrice;
    },
    category: (parent: any) => {
      if (parent.category.hasOwnProperty('name')) {
        return parent;
      } else {
        return null;
      }
    },
  },
  Query: {
    ...categoryResolvers.Query,
  },
  Mutation: {
    ...ingredientResolvers.Mutation,
    ...sizeResolvers.Mutation,
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...customCompositionResolvers.Mutation,
    ...itemResolvers.Mutation,
  },
};
