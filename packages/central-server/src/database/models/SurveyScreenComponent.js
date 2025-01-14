import { SurveyScreenComponentModel as CommonSurveyScreenComponentModel } from '@tupaia/database';
import { compare } from 'compare-versions';
import { SURVEY_SCREEN_COMPONENT_ENTITY_CONFIG_SCHEMA_CHANGE_APP_VERSION } from '../constants';
import { translateEntityConfig } from '../utilities';

export class SurveyScreenComponentModel extends CommonSurveyScreenComponentModel {
  meditrakConfig = {
    minAppVersion: '0.0.1',
    translateRecordForSync: (record, userAppVersion) => {
      if (
        compare(
          userAppVersion,
          SURVEY_SCREEN_COMPONENT_ENTITY_CONFIG_SCHEMA_CHANGE_APP_VERSION,
          '<',
        )
      ) {
        return translateEntityConfig(record);
      }
      return record;
    },
  };
}
