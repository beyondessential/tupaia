/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { hasContent } from '@tupaia/utils';

class OptionType extends DatabaseType {
  static databaseType = TYPES.OPTION;

  static fieldValidators = new Map()
    .set('value', [
      hasContent,
      async (value, model) => {
        const foundConflict = await findFieldConflict('value', value, model);
        if (foundConflict) return 'Found duplicate values in option set';
        return null;
      },
      async (value, model) => {
        if (!model.label) {
          const foundConflict = await findFieldConflict('label', value, model);
          if (foundConflict)
            return 'Label is not provided; value cannot conflict with another label in option set';
          return null;
        }
        return null;
      },
    ])
    .set('label', [
      async (label, model) => {
        if (label) {
          const foundConflict = await findFieldConflict('label', label, model);
          if (foundConflict) return 'Found duplicate label in option set';
        }
        return null;
      },
    ]);
}

export class OptionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return OptionType;
  }

  meditrakConfig = {
    minAppVersion: '1.7.92',
  };
}

const findFieldConflict = async (field, valueToCompare, model) => {
  const conflictingOption = await model.otherModels.option.findOne({
    [field]: valueToCompare || null,
    option_set_id: model.option_set_id,
    id: {
      comparator: '!=',
      comparisonValue: model.id || null,
    },
  });
  return !!conflictingOption;
};
