const columns = {
  id: 'disaster.id',
  type: 'disaster.type::text',
  name: 'disaster.name',
  description: 'disaster.description',
  country: 'country.name',
};

export const findFormattedDisasters = async (models, criteria) => {
  let where = ' where ';
  let whereClause = '';
  const bindParams = [];

  Object.keys(criteria).forEach(key => {
    if (key === 'disaster.id') {
      whereClause += `${where} ${columns.id} = ?`;
      bindParams.push(criteria[key]);
    } else {
      whereClause += criteria[key].ignoreCase
        ? `${where} lower(${columns[key]}) ${criteria[key].comparator} lower(?)`
        : `${where} ${columns[key]} ${criteria[key].comparator} ?`;

      bindParams.push(criteria[key].comparisonValue);
    }
    where = ' and ';
  });

  return models.database.executeSql(
    `SELECT
      "disaster".id, "disaster".type, description, "disaster"."name", "country".name as country,
      ST_AsGeoJSON("point") as point,
      ST_AsGeoJSON("bounds") as bounds
    FROM "disaster"
      LEFT JOIN "entity"
        ON "disaster"."id" = "entity"."code"
      left join "country"
        ON "countryCode" = "country".code
    ${whereClause}`,
    bindParams,
  );
};
