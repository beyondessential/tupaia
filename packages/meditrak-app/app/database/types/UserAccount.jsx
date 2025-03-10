import { Object as RealmObject } from 'realm';

export class UserAccount extends RealmObject {}

UserAccount.schema = {
  name: 'UserAccount',
  primaryKey: 'id',
  properties: {
    id: 'string',
    name: { type: 'string', default: 'Failed to store user details' },
    internal: { type: 'bool', default: false },
  },
};

UserAccount.requiredData = ['id'];

UserAccount.construct = (database, data) => {
  const { firstName, lastName, id, internal } = data;

  const fullName = [firstName, lastName].filter(value => !!value).join(' ');

  return database.update('UserAccount', {
    id,
    name: fullName,
    internal,
  });
};
