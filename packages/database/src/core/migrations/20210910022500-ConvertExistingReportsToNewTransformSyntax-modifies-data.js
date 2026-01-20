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

const convertToNewKeyAndValue = ([key, value]) => {
  const isSimpleKey = key.startsWith("'") && key.endsWith("'");
  const newKey = isSimpleKey ? key.substring(1, key.length - 1) : `=${key}`;
  const newValue = `=${value}`;
  return [newKey, newValue];
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
    title,
    description,
  };

  if (where) {
    newConfig.where = `=${where}`;
  }

  Object.entries(columnsToInsert)
    .map(convertToNewKeyAndValue)
    .forEach(([columnKey, columnValue]) => {
      newConfig.insert = { ...newConfig.insert, [columnKey]: columnValue };
    });

  if (spreadColumns) {
    newConfig.include = spreadColumns;
  } else {
    newConfig.exclude = '*';
  }

  return newConfig;
};

const mergeStrategyNames = {
  drop: 'exclude',
  avg: 'average',
  default: 'last',
};

const convertAggregateToMergeRows = oldConfig => {
  const {
    transform,
    $title: title,
    $description: description,
    where,
    ...columnsToAggregate
  } = oldConfig;
  const newConfig = {
    transform: 'mergeRows',
    title,
    description,
  };

  if (where) {
    newConfig.where = `=${where}`;
  }

  const columnsWithBaseStrategy = [];
  Object.entries(columnsToAggregate).forEach(([column, aggregateFunc]) => {
    const isGroupColumn = aggregateFunc === 'group';
    if (isGroupColumn) {
      if (Array.isArray(newConfig.groupBy)) {
        newConfig.groupBy = [...newConfig.groupBy, column];
      } else if (newConfig.groupBy) {
        newConfig.groupBy = [newConfig.groupBy, column];
      } else {
        newConfig.groupBy = column;
      }
    } else {
      const columnKey = column === '...' ? '*' : column;
      const mergeStrategy = mergeStrategyNames[aggregateFunc]
        ? mergeStrategyNames[aggregateFunc]
        : aggregateFunc;

      if (typeof newConfig.using === 'object' && newConfig.using !== null) {
        newConfig.using = { ...newConfig.using, [columnKey]: mergeStrategy };
      } else if (typeof newConfig.using === 'string' && newConfig.using !== undefined) {
        if (mergeStrategy === newConfig.using) {
          columnsWithBaseStrategy.push(columnKey);
        } else {
          const commonStrategy = newConfig.using;
          const usingObject = Object.fromEntries(
            columnsWithBaseStrategy.map(columnWithBaseStrategy => [
              columnWithBaseStrategy,
              commonStrategy,
            ]),
          );
          usingObject[columnKey] = mergeStrategy;
          newConfig.using = usingObject;
        }
      } else {
        columnsWithBaseStrategy.push(columnKey);
        newConfig.using = mergeStrategy;
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

  newConfig.where = `=not (${where})`;

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
    title,
    description,
  };

  if (where) {
    newConfig.where = `=${where}`;
  }

  Object.entries(columnsToInsert)
    .map(convertToNewKeyAndValue)
    .forEach(([columnKey, columnValue]) => {
      newConfig.columns = { ...newConfig.columns, [columnKey]: columnValue };
    });

  return newConfig;
};

const configMappers = {
  select: convertSelectToUpdateColumns,
  aggregate: convertAggregateToMergeRows,
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
      .replace(/\$row/g, '@current')
      .replace(/\$previous/g, '@previous')
      .replace(/\$next/g, '@next')
      .replace(/\$all/g, '@all')
      .replace(/\$allPrevious/g, '@allPrevious')
      .replace(/\$index/g, '@index')
      .replace(/\$table/g, '@table')
      .replace(/\$where/g, 'where');

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
