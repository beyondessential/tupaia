/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { EventType as CommonEventType, EventModel as CommonEventModel } from '@tupaia/database';

export const SERVICE_TYPES = ['dhis', 'tupaia'];

const getSurveyDateCode = surveyCode => `${surveyCode}SurveyDate`;

export class EventType extends CommonEventType {
  upsertSurveyDateElement = async () => {
    if (this.service_type !== SERVICE_TYPES.DHIS) {
      // Non DHIS groups do not need a SurveyDate element
      return;
    }

    const { id: dataElementId } = await this.otherModels.dataSource.updateOrCreate(
      {
        code: getSurveyDateCode(this.code),
      },
      {
        service_type: 'dhis',
        config: { isDataRegional: this.config.isDataRegional },
      },
    );
    await this.attachDataElement(dataElementId);
  };

  deleteSurveyDateElement = async () => {
    await this.otherModels.dataSource.delete({
      code: getSurveyDateCode(this.code),
    });
  };
}

export class EventModel extends CommonEventModel {
  isDeletableViaApi = true;

  get DatabaseTypeClass() {
    return EventType;
  }
}
