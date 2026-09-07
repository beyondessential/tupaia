import fs from 'node:fs';
import {
  respond,
  DatabaseError,
  UploadError,
  ImportValidationError,
} from '@tupaia/utils';
import { assertBESAdminAccess } from '../../../permissions';

const parseFeatureCollection = filePath => {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    throw new UploadError(error);
  }
  let geojson;
  try {
    geojson = JSON.parse(raw);
  } catch (error) {
    throw new ImportValidationError(`Uploaded file is not valid JSON: ${error.message}`);
  }
  if (geojson?.type === 'Feature') return [geojson];
  if (geojson?.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
    return geojson.features;
  }
  throw new ImportValidationError(
    'Uploaded file must be a GeoJSON Feature or FeatureCollection',
  );
};

const toMultiPolygon = (geometry, featureIndex) => {
  if (!geometry || typeof geometry !== 'object') {
    throw new ImportValidationError('Feature is missing geometry', featureIndex);
  }
  if (geometry.type === 'MultiPolygon') return geometry;
  if (geometry.type === 'Polygon') {
    return { type: 'MultiPolygon', coordinates: [geometry.coordinates] };
  }
  throw new ImportValidationError(
    `Feature geometry must be Polygon or MultiPolygon (got: ${geometry.type})`,
    featureIndex,
  );
};

const upsertFeature = async (db, feature, index) => {
  const properties = feature.properties ?? {};
  const { id = null, name, code = null, data_source: dataSource } = properties;

  if (!name) {
    throw new ImportValidationError('Feature properties.name is required', index);
  }
  if (!dataSource) {
    throw new ImportValidationError('Feature properties.data_source is required', index);
  }

  const multiPolygon = toMultiPolygon(feature.geometry, index);
  const geomJson = JSON.stringify(multiPolygon);

  // Match-key precedence:
  //   1. properties.id  — round-trip with export (this is why we deviate
  //      from the importEntities `code`-match convention; an exported
  //      .geojson always carries its source id so re-uploads update in place).
  //   2. (code, data_source) — for hand-authored uploads with no id, fall
  //      back to the natural unique index on entity_polygon.
  // We do NOT silently insert when an id is supplied but doesn't exist —
  // that would mask typos. Unknown ids are rejected.
  if (id) {
    const [existing] = await db.executeSql(
      'SELECT id FROM entity_polygon WHERE id = ?;',
      [id],
    );
    if (!existing) {
      throw new ImportValidationError(
        `Feature properties.id "${id}" does not match any existing entity_polygon. Remove the id to create a new row.`,
        index,
      );
    }
    await db.executeSql(
      `
        UPDATE entity_polygon
        SET polygon = ST_Multi(ST_GeomFromGeoJSON(?)),
            name = ?,
            code = ?,
            data_source = ?,
            updated_at = now()
        WHERE id = ?;
      `,
      [geomJson, name, code, dataSource, id],
    );
    return { action: 'updated', id };
  }

  if (code) {
    const [existingByNaturalKey] = await db.executeSql(
      'SELECT id FROM entity_polygon WHERE code = ? AND data_source = ?;',
      [code, dataSource],
    );
    if (existingByNaturalKey) {
      await db.executeSql(
        `
          UPDATE entity_polygon
          SET polygon = ST_Multi(ST_GeomFromGeoJSON(?)),
              name = ?,
              updated_at = now()
          WHERE id = ?;
        `,
        [geomJson, name, existingByNaturalKey.id],
      );
      return { action: 'updated', id: existingByNaturalKey.id };
    }
  }

  const [{ id: newId }] = await db.executeSql(
    `
      INSERT INTO entity_polygon (polygon, name, code, data_source)
      VALUES (ST_Multi(ST_GeomFromGeoJSON(?)), ?, ?, ?)
      RETURNING id;
    `,
    [geomJson, name, code, dataSource],
  );
  return { action: 'created', id: newId };
};

export async function importEntityPolygons(req, res) {
  await req.assertPermissions(assertBESAdminAccess);

  if (!req.file) {
    throw new UploadError();
  }

  const features = parseFeatureCollection(req.file.path);
  if (features.length === 0) {
    throw new ImportValidationError('No features found in uploaded file');
  }

  let created = 0;
  let updated = 0;

  try {
    await req.models.wrapInTransaction(async transactingModels => {
      for (let index = 0; index < features.length; index++) {
        const result = await upsertFeature(transactingModels.database, features[index], index);
        if (result.action === 'created') {
          created += 1;
        } else {
          updated += 1;
          // Geometry may have changed, so refresh the cached bounds of any
          // entities linked to this polygon, otherwise the map keeps zooming
          // to the old location.
          await transactingModels.entity.updateLinkedBoundsForPolygon(result.id);
        }
      }
    });
  } catch (error) {
    if (error.respond) throw error;
    throw new DatabaseError('importing entity polygons', error);
  }

  respond(res, {
    message: `Imported ${features.length} polygon${features.length === 1 ? '' : 's'}`,
    created,
    updated,
  });
}
