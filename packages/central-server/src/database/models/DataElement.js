/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import {
  DataElementType as CommonDataElementType,
  DataElementModel as CommonDataElementModel,
} from '@tupaia/database';

export const DATA_SOURCE_SERVICE_TYPES = ['dhis', 'tupaia', 'data-lake', 'superset'];

const getSurveyDateCode = surveyCode => `${surveyCode}SurveyDate`;

export class DataElementType extends CommonDataElementType {
  upsertSurveyDateElement = async () => {
    this.assertFnCalledByDataGroup(this.upsertSurveyDateElement.name);

    if (this.service_type !== this.SERVICE_TYPES.DHIS) {
      // Non DHIS groups do not need a SurveyDate element
      return;
    }

    const { id: dataElementId } = await this.model.updateOrCreate(
      {
        type: this.getTypes().DATA_ELEMENT,
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
    this.assertFnCalledByDataGroup(this.deleteSurveyDateElement.name);

    await this.model.delete({
      type: this.getTypes().DATA_ELEMENT,
      code: getSurveyDateCode(this.code),
    });
  };
}

export class DataElementModel extends CommonDataElementModel {
  isDeletableViaApi = true;

  get DatabaseTypeClass() {
    return DataElementType;
  }
}
