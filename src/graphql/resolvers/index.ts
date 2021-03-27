import ingredientResolvers from './ingredient';
import sizeResolvers from './size';
import userResolvers from './user';

export default {
  Mutation: {
    ...ingredientResolvers.Mutation,
    ...sizeResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
