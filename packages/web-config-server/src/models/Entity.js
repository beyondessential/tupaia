import { pascal } from 'case';
import {
  EntityRecord as CommonEntityRecord,
  EntityModel as CommonEntityModel,
} from '@tupaia/database';
import { calculateOuterBounds } from '@tupaia/utils';

class EntityRecord extends CommonEntityRecord {
  getOrganisationLevel() {
    return pascal(this.type); // sub_district -> SubDistrict
  }

  translateForFrontend() {
    return {
      type: pascal(this.type),
      organisationUnitCode: this.code,
      countryCode: this.country_code,
      name: this.name,
      location: this.translateLocationForFrontend(),
      photoUrl: this.image_url,
    };
  }

  translateLocationForFrontend() {
    const { point, entity_polygon_id } = this;

    const type = (() => {
      if (entity_polygon_id) return 'area';
      if (point) return 'point';
      return 'no-coordinates';
    })();

    return {
      type,
      point: this.getPoint(),

      // When possible return the bounds for an entity based on the entities the user has access to
      bounds: this.entitiesWithAccess
        ? calculateOuterBounds(this.entitiesWithAccess.map(entity => entity.bounds))
        : this.getBounds(),
      region: this.getPolygon(),
    };
  }
}
export class EntityModel extends CommonEntityModel {
  get DatabaseRecordClass() {
    return EntityRecord;
  }
}
