import { DatatrakWebModelRegistry } from '../types/model';

export const testLocalSync = async (models: DatatrakWebModelRegistry) => {
  console.log('testLocalSync');
  await models.optionSet.updateOrCreate(
    {
      name: 'lalal',
    },
    {
      name: 'lalal',
    },
  );
};
