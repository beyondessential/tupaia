import { ValidationError } from '@tupaia/utils';
import { BESAdminCreateHandler } from '../CreateHandler';

const toMultiPolygonGeoJson = polygon => {
  // The admin-panel JsonEditor widget posts the value as a JSON string
  // (stringify defaults to true), so accept either a string or an object.
  let geometry = polygon;
  if (typeof geometry === 'string') {
    try {
      geometry = JSON.parse(geometry);
    } catch (error) {
      throw new ValidationError('polygon must be valid GeoJSON (could not parse JSON string)');
    }
  }
  if (!geometry || typeof geometry !== 'object') {
    throw new ValidationError('polygon must be a GeoJSON geometry object');
  }
  if (geometry.type === 'MultiPolygon') return geometry;
  if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  }
  throw new ValidationError(
    `polygon must be type Polygon or MultiPolygon (got: ${geometry.type ?? typeof geometry})`,
  );
};

export class CreateEntityPolygon extends BESAdminCreateHandler {
  async createRecord() {
    const { name, code = null, data_source: dataSource, polygon } = this.newRecordData;

    if (!name) throw new ValidationError('name is required');
    if (!dataSource) throw new ValidationError('data_source is required');

    const multiPolygon = toMultiPolygonGeoJson(polygon);

    const [{ id }] = await this.models.database.executeSql(
      `
        INSERT INTO entity_polygon (polygon, name, code, data_source)
        VALUES (ST_Multi(ST_GeomFromGeoJSON(?)), ?, ?, ?)
        RETURNING id;
      `,
      [JSON.stringify(multiPolygon), name, code, dataSource],
    );

    return { entityPolygonId: id };
  }
}
