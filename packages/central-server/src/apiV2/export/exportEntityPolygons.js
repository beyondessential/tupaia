import fs from 'node:fs';
import { respondWithDownload, toFilename } from '@tupaia/utils';
import { getExportPathForUser } from '@tupaia/server-utils';
import { assertBESAdminAccess } from '../../permissions';

const buildFeatureCollection = polygon => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: JSON.parse(polygon.polygon),
      properties: {
        id: polygon.id,
        code: polygon.code,
        name: polygon.name,
        data_source: polygon.data_source,
      },
    },
  ],
});

const buildFileName = polygon => {
  const parts = [polygon.code, polygon.data_source].filter(Boolean);
  return toFilename(`${parts.join('-') || polygon.id}.geojson`, false);
};

export async function exportEntityPolygons(req, res) {
  await req.assertPermissions(assertBESAdminAccess);

  const { models, userId } = req;
  const { entityPolygonId } = req.params;

  const polygon = await models.entityPolygon.findOne({ id: entityPolygonId });
  if (!polygon) {
    res.status(404).json({ error: `entityPolygon ${entityPolygonId} not found` });
    return;
  }

  const featureCollection = buildFeatureCollection(polygon);
  const filePath = `${getExportPathForUser(userId)}/${buildFileName(polygon)}`;
  fs.writeFileSync(filePath, JSON.stringify(featureCollection));

  respondWithDownload(res, filePath);
}
