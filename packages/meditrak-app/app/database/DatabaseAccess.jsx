import { SyncingDatabase } from './SyncingDatabase';
import { CURRENT_USER_EMAIL } from '../settings';
import { constructRecord } from './constructRecord';
import { combineClauses, conditionsToClauses } from './helpers';

export class DatabaseAccess extends SyncingDatabase {
  getSurveys(countryId) {
    if (!countryId) return [];

    return this.objects('Survey').filter(survey => survey.isAvailableInCountry(countryId));
  }

  getEntities(where) {
    const filters = conditionsToClauses(where);
    let query = this.objects('Entity').sorted('name');
    if (filters) {
      query = query.filtered(combineClauses(filters, 'AND'));
    }

    return query;
  }

  getCountries() {
    return this.objects('Country').filtered('name != "No Country"');
  }

  getCountryEntities() {
    return this.objects('Entity').filtered('type = "country" AND name != "No Country"');
  }

  getDescendantsOfCountry(country) {
    return this.objects('Entity').filtered(`countryCode = "${country.code}"`);
  }

  getCountry(id) {
    return this.findOne('Country', id, 'id');
  }

  getQuestion(id) {
    return this.findOne('Question', id, 'id');
  }

  findSurveyResponses(conditions) {
    return this.find('Response', conditions);
  }

  saveImage(fileId, imageData) {
    this.write(() => {
      const image = this.create('Image', {
        id: fileId,
        data: imageData,
      });
      this.addChangeToSync('AddSurveyImage', image.id);
    });
  }

  saveFile(fileId, uniqueFileName, filePathOnDevice) {
    this.write(() => {
      this.create('File', {
        id: fileId,
        uniqueFileName,
        filePathOnDevice,
      });
      this.addChangeToSync('AddSurveyFile', fileId);
    });
  }

  saveOptionObjects(optionObjects) {
    return optionObjects.map(optionObject => this.create('Option', optionObject));
  }

  saveSurveyResponse(responseObject, answersObjects, newObjects = {}) {
    this.write(() => {
      const { entityObjects = [], optionObjects = [] } = newObjects;
      const answers = answersObjects.map(answerObject => this.create('Answer', answerObject));

      const entitiesUpserted = entityObjects.map(entityObject =>
        this.update('Entity', entityObject),
      );
      const optionsCreated = this.saveOptionObjects(optionObjects);
      const surveyResponse = this.create('Response', {
        ...responseObject,
        answers,
        entitiesUpserted,
        optionsCreated,
      });
      this.addChangeToSync('SubmitSurveyResponse', surveyResponse.id);
    });
  }

  getCurrentUser() {
    return this.getUser(this.getCurrentLoginDetails().emailAddress);
  }

  getUser(emailAddress) {
    return this.findOne('User', emailAddress, 'emailAddress');
  }

  updateUser(userDetails) {
    let user;
    this.write(() => {
      // If no email address was supplied, update based on id, i.e. find a user with the matching
      // id and use that email address as the primary key to update
      if (!userDetails.emailAddress) {
        if (!userDetails.id) {
          throw new Error('Unable to update user as no id or email address was supplied');
        }
        const existingUser = this.findOne('User', userDetails.id);
        if (!existingUser) {
          throw new Error(
            'Unable to update user as they do not exist and no email address was supplied',
          );
        }
        user = constructRecord(this, 'User', {
          emailAddress: existingUser.emailAddress,
          ...userDetails,
        });
      } else {
        user = constructRecord(this, 'User', userDetails);
      }
    });
    return user;
  }

  clearCurrentUserSession() {
    const user = this.getCurrentUser();
    this.write(() => {
      user.passwordHash = '';
    });
  }

  setCurrentLoginEmail(emailAddress) {
    this.setSetting(CURRENT_USER_EMAIL, emailAddress);
  }

  getCurrentLoginDetails() {
    return {
      emailAddress: this.getSetting(CURRENT_USER_EMAIL),
    };
  }

  getOptionSetById(optionSetId) {
    return this.findOne('OptionSet', optionSetId);
  }

  getAncestorsOfPermissionGroup(permissionGroup, acc = []) {
    if (!permissionGroup || !permissionGroup.parentId) {
      return acc;
    }

    const parent = this.findOne('PermissionGroup', permissionGroup.parentId);

    if (!parent) {
      return acc;
    }

    return this.getAncestorsOfPermissionGroup(parent, [...acc, parent.id]);
  }

  getUsersByPermissionGroupAndCountry(
    countryCode,
    permissionGroupId,
    excludeInternalUsers = false,
  ) {
    // get user entity permission entries by the country code and permission group name
    const countryEntity = this.getEntities({ code: countryCode })[0];

    const permissionGroup = this.findOne('PermissionGroup', permissionGroupId, 'id');

    const ancestors = this.getAncestorsOfPermissionGroup(permissionGroup);

    const permissionGroupIds = [permissionGroup.id, ...ancestors];

    const userEntityPermissionEntries = this.objects('UserEntityPermission').filtered(
      combineClauses(
        [
          conditionsToClauses({ entityId: countryEntity.id }),
          conditionsToClauses({ permissionGroupId: permissionGroupIds }),
        ],
        'AND',
      ),
    );

    const userIds = [...new Set(userEntityPermissionEntries.map(entry => entry.userId))];

    if (userIds.length === 0) {
      return [];
    }

    const clauses = conditionsToClauses({ id: userIds });
    if (excludeInternalUsers) {
      clauses.push('internal = false');
    }

    const userQuery = combineClauses(clauses, 'AND');

    const users = this.objects('UserAccount').filtered(userQuery);

    return users;
  }
}
