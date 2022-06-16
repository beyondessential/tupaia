/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  DataGroupType as CommonDataGroupType,
  DataGroupModel as CommonDataGroupModel,
} from '@tupaia/database';

export const SERVICE_TYPES = ['dhis', 'tupaia'];

const getSurveyDateCode = surveyCode => `${surveyCode}SurveyDate`;

export class DataGroupType extends CommonDataGroupType {
  upsertSurveyDateElement = async () => {
    if (this.service_type !== SERVICE_TYPES.DHIS) {
      // Non DHIS groups do not need a SurveyDate element
      return;
    }

    const { id: dataElementId } = await this.otherModels.dataElement.updateOrCreate(
      {
        code: getSurveyDateCode(this.code),
      },
      {
        service_type: 'dhis',
        config: { dhisInstanceCode: this.config.dhisInstanceCode },
      },
    );
    await this.attachDataElement(dataElementId);
  };

  deleteSurveyDateElement = async () => {
    await this.otherModels.dataElement.delete({
      code: getSurveyDateCode(this.code),
    });
  };
}

export class DataGroupModel extends CommonDataGroupModel {
  isDeletableViaApi = true;

  get DatabaseTypeClass() {
    return DataGroupType;
  }
}
