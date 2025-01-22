import {
  DataElementRecord as CommonDataElementRecord,
  DataElementModel as CommonDataElementModel,
} from '@tupaia/database';

export const DATA_SOURCE_SERVICE_TYPES = [
  'data-lake',
  'dhis',
  'indicator',
  'kobo',
  'superset',
  'tupaia',
  'weather',
];

const getSurveyDateCode = surveyCode => `${surveyCode}SurveyDate`;

export class DataElementRecord extends CommonDataElementRecord {
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

  get DatabaseRecordClass() {
    return DataElementRecord;
  }
}
