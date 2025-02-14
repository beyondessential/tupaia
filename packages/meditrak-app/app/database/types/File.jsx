import { Object as RealmObject } from 'realm';

export class File extends RealmObject {
  toJson() {
    return {
      id: this.id,
      uniqueFileName: this.uniqueFileName,
      filePathOnDevice: this.filePathOnDevice,
    };
  }
}

File.schema = {
  name: 'File',
  primaryKey: 'id',
  properties: {
    id: 'string',
    uniqueFileName: 'string',
    filePathOnDevice: 'string',
  },
};

File.construct = () => {
  throw new Error('Syncing in files not yet supported');
};
