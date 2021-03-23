import { Size } from '../../util/types';
import SizeModel from '../../models/Size';
import { validateSizeInput } from '../../util/validators';
import checkAuth from '../../util/check-auth';
import ac from '../../models/UserRoles';

export default {
  Query: {
    getSize: async () => {},
    getSizes: async () => {},
  },
  Mutation: {
    createSize: async (
      _: any,
      args: { name: string; values: string[] },
      context: any,
    ): Promise<Size> => {
      const { name, values } = args;

      const { role: userRole } = await checkAuth(context);

      const { granted } = ac.can(userRole).createAny('SIZE');

      if (!granted) {
        throw new Error('Not authorized to perform this action.');
      }

      const { valid, errors } = validateSizeInput(name, values);

      if (!valid) {
        const message = Object.keys(errors)
          .map((key) => (errors as any)[key])
          .join(' ');
        throw new Error(`${message}`);
      }

      const size = new SizeModel({ name, values });

      try {
        await size.save();
      } catch (err) {
        throw new Error(`Unexpected error. ${err}`);
      }

      return size.toObject({ getters: true });
    },
    updateSize: async () => {},
    deleteSize: async () => {},
  },
};
