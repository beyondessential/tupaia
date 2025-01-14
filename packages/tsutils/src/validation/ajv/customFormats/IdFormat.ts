import { takesIdForm } from '@tupaia/utils';

export const IdFormat = {
  name: 'id',
  config: {
    validate: (data: string) => {
      try {
        takesIdForm(data);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
};
