import { ValidationError } from '@tupaia/utils';
import { BESAdminCreateHandler } from '../CreateHandler';

const toMultiPolygonGeoJson = polygon => {
  if (!polygon || typeof polygon !== 'object') {
    throw new ValidationError('polygon must be a GeoJSON geometry object');
  }
  if (polygon.type === 'MultiPolygon') return polygon;
  if (polygon.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [polygon.coordinates] };
  }
  throw new ValidationError(
    `polygon must be type Polygon or MultiPolygon (got: ${polygon.type ?? typeof polygon})`,
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
