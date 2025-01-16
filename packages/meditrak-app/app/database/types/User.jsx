import { Object as RealmObject } from 'realm';
import { AccessPolicy } from '@tupaia/access-policy';

export class User extends RealmObject {
  accessPolicySingleton = null;

  get accessPolicy() {
    if (!this.accessPolicySingleton) {
      this.accessPolicySingleton = new AccessPolicy(this.accessPolicyData);
    }
    return this.accessPolicySingleton;
  }

  hasAccessToSomeEntity(entities) {
    return this.accessPolicy.allowsSome(entities.map(e => e.code));
  }

  /**
   * Whether this survey is available to the given user. Checks whether that user has access to the
   * permission group required by this survey, in the selected country.
   */
  hasAccessToSurveyInCountry(survey, country) {
    const { permissionGroup } = survey;
    if (!permissionGroup) return false; // this survey is not fully synced yet, don't show it
    return this.accessPolicy.allows(country.code, permissionGroup.name);
  }
}

User.schema = {
  name: 'User',
  primaryKey: 'emailAddress',
  properties: {
    id: { type: 'string', default: 'Failed to store user details' },
    emailAddress: 'string',
    passwordHash: { type: 'string', default: 'Failed to store user details' },
    name: { type: 'string', default: 'Failed to store user details' },
    accessPolicyData: { type: 'string', default: 'Failed to store user details' },
    isRequestedAccountDeletion: { type: 'bool', default: false },
  },
};

User.requiredData = ['emailAddress'];

User.construct = (database, data) => {
  const { accessPolicy, ...userObject } = data;
  userObject.accessPolicyData = JSON.stringify(accessPolicy);
  return database.update('User', userObject);
};
