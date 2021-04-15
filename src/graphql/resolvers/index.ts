import ingredientResolvers from './ingredient';
import sizeResolvers from './size';
import userResolvers from './user';
import categoryResolvers from './category';
import customCompositionResolvers from './customComposition';
import itemResolvers from './item';

export default {
  Category: { ...categoryResolvers.Category },
  CustomComposition: { ...customCompositionResolvers.CustomComposition },
  Ingredient: { ...ingredientResolvers.Ingredient },
  Item: { ...itemResolvers.Item },
  Query: {
    ...categoryResolvers.Query,
    ...customCompositionResolvers.Query,
    ...ingredientResolvers.Query,
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
