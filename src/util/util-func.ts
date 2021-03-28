import { SizeDoc } from './types';

export const sizeCheck = (
  price: { size: string; price: number }[],
  size: SizeDoc,
): void => {
  const sizeCheck = price.reduce(
    (acc, prc) => {
      return acc.filter((val) => val !== prc.size);
    },
    [...size.toObject().values],
  );

  if (sizeCheck.length > 0) {
    throw new Error(`Following sizes were not provided: ${sizeCheck.join('')}`);
  }
};
