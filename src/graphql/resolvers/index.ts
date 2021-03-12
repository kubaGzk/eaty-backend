import categoryResolvers from './category';
import userResolvers from './user';

export default {
  Mutation: {
    ...categoryResolvers.Mutation,
    ...userResolvers.Mutation,
  },
};
