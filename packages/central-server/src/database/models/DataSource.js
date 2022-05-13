/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  DataSourceType as CommonDataSourceType,
  DataSourceModel as CommonDataSourceModel,
} from '@tupaia/database';

export const DATA_SOURCE_SERVICE_TYPES = ['dhis', 'tupaia', 'data-lake'];

const getSurveyDateCode = surveyCode => `${surveyCode}SurveyDate`;

export class DataSourceType extends CommonDataSourceType {
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

export class DataSourceModel extends CommonDataSourceModel {
  isDeletableViaApi = true;

  get DatabaseTypeClass() {
    return DataSourceType;
  }
}
