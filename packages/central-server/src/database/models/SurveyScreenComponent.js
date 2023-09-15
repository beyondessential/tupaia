/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SurveyScreenComponentModel as CommonSurveyScreenComponentModel } from '@tupaia/database';
import { compare } from 'compare-versions';
import { CONFIG_BREAK_MEDITRAK_APP_VERSION } from '../constants';
import { translateEntityConfig } from '../utilities';

export class SurveyScreenComponentModel extends CommonSurveyScreenComponentModel {
  meditrakConfig = {
    minAppVersion: '0.0.1',
    translateRecordForSync: (record, userAppVersion) => {
      if (compare(userAppVersion, CONFIG_BREAK_MEDITRAK_APP_VERSION, '<')) {
        return translateEntityConfig(record);
      }
      return record;
    },
  };
}
