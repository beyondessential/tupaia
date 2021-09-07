'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const convertSelectToUpdateColumns = oldConfig => {
  const {
    transform,
    $title: title,
    $description: description,
    where,
    '...': spreadColumns,
    ...columnsToInsert
  } = oldConfig;
  const newConfig = {
    transform: 'updateColumns',
    where,
    title,
    description,
  };

  Object.entries(columnsToInsert).forEach(([columnKey, columnValue]) => {
    const isSimpleKey = columnKey.startsWith("'") && columnKey.endsWith("'");
    const newColumnKey = isSimpleKey
      ? columnKey.substring(1, columnKey.length - 1)
      : `=${columnKey}`;

    newConfig.insert = { ...newConfig.insert, [newColumnKey]: columnValue };
  });

  if (spreadColumns) {
    newConfig.include = spreadColumns;
  } else {
    newConfig.exclude = '*';
  }

  return newConfig;
};

const convertAggregateToGroupRows = oldConfig => {
  const {
    transform,
    $title: title,
    $description: description,
    where,
    ...columnsToAggregate
  } = oldConfig;
  const newConfig = {
    transform: 'groupRows',
    where,
    title,
    description,
  };

  Object.entries(columnsToAggregate).forEach(([column, aggregateFunc]) => {
    const isGroupColumn = aggregateFunc === 'group';
    if (isGroupColumn) {
      if (Array.isArray(newConfig.by)) {
        newConfig.by = [...newConfig.by, column];
      } else if (newConfig.by) {
        newConfig.by = [newConfig.by, column];
      } else {
        newConfig.by = column;
      }
    } else {
      const columnKey = column === '...' ? '*' : column;
      const mergeStrategy = aggregateFunc === 'drop' ? 'exclude' : aggregateFunc;
      if (typeof newConfig.mergeUsing === 'object' && newConfig.mergeUsing !== null) {
        newConfig.mergeUsing = { ...newConfig.mergeUsing, [columnKey]: mergeStrategy };
      } else {
        newConfig.mergeUsing = { [columnKey]: mergeStrategy };
      }
    }
  });

  return newConfig;
};

const convertSortToSortRows = oldConfig => {
  const { transform, $title: title, $description: description, by, descending } = oldConfig;
  const newConfig = {
    transform: 'sortRows',
    title,
    description,
  };

  newConfig.by = `=${by}`;

  if (descending) {
    newConfig.direction = 'desc';
  }

  return newConfig;
};

const convertFilterToExcludeRows = oldConfig => {
  const { transform, $title: title, $description: description, where } = oldConfig;
  const newConfig = {
    transform: 'excludeRows',
    title,
    description,
  };

  newConfig.where = `not (${where})`;

  return newConfig;
};

const convertInsertToInsertRows = oldConfig => {
  const {
    transform,
    $title: title,
    $description: description,
    position,
    where,
    ...columnsToInsert
  } = oldConfig;
  const newConfig = {
    transform: 'insertRows',
    position,
    where,
    title,
    description,
  };

  Object.entries(columnsToInsert).forEach(([columnKey, columnValue]) => {
    const isSimpleKey = columnKey.startsWith("'") && columnKey.endsWith("'");
    const newColumnKey = isSimpleKey
      ? columnKey.substring(1, columnKey.length - 1)
      : `=${columnKey}`;

    newConfig.columns = { ...newConfig.columns, [newColumnKey]: columnValue };
  });

  return newConfig;
};

const configMappers = {
  select: convertSelectToUpdateColumns,
  aggregate: convertAggregateToGroupRows,
  sort: convertSortToSortRows,
  filter: convertFilterToExcludeRows,
  insert: convertInsertToInsertRows,
};

const convertTransformConfig = transformConfig => {
  if (transformConfig.transform) {
    const configMapper = configMappers[transformConfig.transform];
    if (configMapper) {
      return configMapper(transformConfig);
    }
  }

  return transformConfig;
};

const getNewConfig = config => ({
  ...config,
  transform: config.transform.map(convertTransformConfig),
});

const getReports = async db => (await db.runSql('SELECT * from report')).rows;

exports.up = async function (db) {
  const reports = await getReports(db);

  // Disabling trigger as otherwise encountered an error: payload string too long
  // This is caused by the trigger trying to pass a payload of over 8000 bytes to the notify channel
  await db.runSql('ALTER TABLE report DISABLE TRIGGER report_trigger;');
  for (let i = 0; i < reports.length; i++) {
    const { code, config } = reports[i];
    const newConfig = getNewConfig(config);
    const newConfigString = JSON.stringify(newConfig)
      .replace(/'/g, "''")
      .replace(/\$row\./g, '$')
      .replace(/\$row/g, '@row')
      .replace(/\$previous/g, '@previous')
      .replace(/\$next/g, '@next')
      .replace(/\$all/g, '@all')
      .replace(/\$allPrevious/g, '@allPrevious')
      .replace(/\$index/g, '@index')
      .replace(/\$table/g, '@table')
      .replace(/\$where/g, '@where');

    await db.runSql(`
        UPDATE report
        SET config = '${newConfigString}'::jsonb
        WHERE code = '${code}';
      `);
  }
  await db.runSql('ALTER TABLE report ENABLE TRIGGER report_trigger;');

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
