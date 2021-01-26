/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { pascal } from 'case';
import { EntityType as CommonEntityType, EntityModel as CommonEntityModel } from '@tupaia/database';

import {
  translateBoundsForFrontend,
  translatePointForFrontend,
  translateRegionForFrontend,
} from '/utils/geoJson';

class EntityType extends CommonEntityType {
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
    const { point, region, bounds } = this;

    const type = (() => {
      if (region) return 'area';
      if (point) return 'point';
      return 'no-coordinates';
    })();

    return {
      type,
      point: translatePointForFrontend(point),
      bounds: translateBoundsForFrontend(bounds),
      region: translateRegionForFrontend(region),
    };
  }
}
export class EntityModel extends CommonEntityModel {
  get DatabaseTypeClass() {
    return EntityType;
  }
}
