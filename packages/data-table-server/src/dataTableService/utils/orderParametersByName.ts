import { DataTableParameter } from '../types';

export const orderParametersByName = (parameters: DataTableParameter[], namesOrder: string[]) => {
  return parameters.sort(({ name: name1 }, { name: name2 }) =>
    namesOrder.indexOf(name1) > namesOrder.indexOf(name2) ? 1 : -1,
  );
};
