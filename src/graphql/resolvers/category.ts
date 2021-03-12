import { Size } from '../../util/types';
// import SizeModel from '../../models/Size';

export default {
  // Query: {
  //   // getCategory: (_, { categoryId: string }): Category => {
  //   // },
  // },
  Mutation: {
    createSize: (
      _: any,
      args: { name: string; values: string[] },
    ): Size => {
      const { name, values } = args;

      const mappedValues = values.map((val) => ({ value: val }));

      return { name, values: mappedValues, id: '22' };
    },
  },
};
