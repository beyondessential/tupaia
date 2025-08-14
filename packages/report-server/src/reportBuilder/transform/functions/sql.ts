import { yup } from '@tupaia/utils';
import alasql from 'alasql';

import { TransformTable } from '../table';
import { Row } from '../../types';

type SqlParams = {
  sql: string;
};

export const paramsValidator = yup.object().shape({
  sql: yup.string().required(),
});

const sqlTransform = (table: TransformTable, params: SqlParams) => {
  const { sql } = params;

  // console.log('alasql', alasql);

  // Insert the table
  alasql('DROP TABLE IF EXISTS transform_table');
  alasql('CREATE TABLE transform_table');
  // @ts-ignore Alasql ts is incorrect here
  alasql.tables.transform_table.data = table.getRows();
  const response = alasql(sql) as Row[];
  const columns = new Set<string>();
  response.forEach(row => Object.keys(row).forEach(column => columns.add(column)));

  return new TransformTable(Array.from(columns), response);
};

export const buildSql = (params: unknown) => {
  const builtSqlParams = paramsValidator.validateSync(params);
  return (table: TransformTable) => sqlTransform(table, builtSqlParams);
};
