import ingredientResolvers from './ingredient';
import sizeResolvers from './size';
import userResolvers from './user';
import categoryResolvers from './category';
import customCompositionResolvers from './customComposition';
import itemResolvers from './item';

export default {
  Mutation: {
    ...ingredientResolvers.Mutation,
    ...sizeResolvers.Mutation,
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...customCompositionResolvers.Mutation,
    ...itemResolvers.Mutation,
  },
};
