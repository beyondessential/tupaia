import { Object as RealmObject } from 'realm';
import RNFS from 'react-native-fs';

import { arrayWithIdsToObject } from '../../utilities/arrayWithIdsToObject';
import { doesIdExist, doesValueExist, updateListOfStrings } from './utilities';

export class Survey extends RealmObject {
  addScreenIfUnique(screen) {
    if (doesIdExist(this.screens, screen.id)) return;
    this.screens.push(screen);
  }

  updateCountryIds(database, newCountryIds) {
    const addCountryId = countryId => this.countryIds.push(countryId);
    updateListOfStrings(database, this.countryIds, newCountryIds, addCountryId);
  }

  /**
   * Whether this survey is available for the given country id. A survey is available to all
   * countries by default if there are none specified in countryIds.
   */
  isAvailableInCountry(countryId) {
    return this.countryIds.length === 0 || doesValueExist(this.countryIds, 'string', countryId);
  }

  getDataForReduxStore() {
    const screens = this.screens.sorted('screenNumber');
    const screenData = screens.map(screen => screen.getReduxStoreData());

    const questions = [];
    screens.forEach(screen => questions.push(...screen.getQuestionsForReduxStore()));

    return {
      screens: screenData,
      questions: arrayWithIdsToObject(questions),
    };
  }

  getReduxStoreData() {
    const { name, imageName, canRepeat, group } = this;
    return {
      name,
      imageName,
      canRepeat,
      group: group && group.getReduxStoreData(),
    };
  }
}

Survey.schema = {
  name: 'Survey',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Survey not properly synchronised' },
    description: { type: 'string', optional: true },
    imageName: { type: 'string', optional: true },
    permissionGroup: { type: 'object', objectType: 'PermissionGroup', optional: true },
    canRepeat: { type: 'bool', default: false },
    screens: { type: 'list', objectType: 'SurveyScreen' },
    countryIds: { type: 'list', objectType: 'RealmString' },
    group: { type: 'object', objectType: 'SurveyGroup', optional: true },
  },
};

Survey.requiredData = ['name'];

Survey.storeImageData = (surveyId, imageData) => {
  const fileName = `survey-image-${surveyId}.png`;
  RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${fileName}`, imageData, 'base64');

  return fileName;
};

Survey.construct = (database, data) => {
  const { countryIds, imageData, surveyGroupId, permissionGroupId, ...restOfData } = data;
  if (imageData) {
    restOfData.imageName = Survey.storeImageData(data.id, imageData);
  }
  if (surveyGroupId) {
    restOfData.group = database.getOrCreate('SurveyGroup', surveyGroupId);
  }
  if (permissionGroupId) {
    restOfData.permissionGroup = database.getOrCreate('PermissionGroup', permissionGroupId);
  }
  const survey = database.update('Survey', restOfData);

  survey.updateCountryIds(database, countryIds);
  return survey;
};
