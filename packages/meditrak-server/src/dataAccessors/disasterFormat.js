export const findFormattedDisasters = async (models, criteria, findOrCount = 'find') => {
  console.log(findOrCount);
  return models.database.executeSql(`
  SELECT 
    "disaster".id, "disaster".type, description, "disaster"."name", "country".name as country,
    ST_AsGeoJSON("point") as point,
    ST_AsGeoJSON("bounds") as bounds
  FROM "disaster"
    LEFT JOIN "entity"
      ON "disaster"."id" = "entity"."code"
     left join "country"
      ON "countryCode" = "country".code;
`);
};
