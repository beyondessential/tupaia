import { pascal } from 'case';
import {
  EntityRecord as CommonEntityRecord,
  EntityModel as CommonEntityModel,
} from '@tupaia/database';

class EntityRecord extends CommonEntityRecord {
  getOrganisationLevel() {
    return pascal(this.type); // sub_district -> SubDistrict
  }
}
export class EntityModel extends CommonEntityModel {
  get DatabaseRecordClass() {
    return EntityRecord;
  }
}
