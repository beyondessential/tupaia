/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

const escapeClause = clause => `(${clause})`;

const escapeValue = value => (typeof value === 'string' ? `"${value}"` : value);

export const combineClauses = (clauses, operator) =>
  clauses.map(clause => escapeClause(clause)).join(` ${operator} `);

export const conditionsToClauses = (conditions = {}) =>
  Object.entries(conditions).reduce((clauses, [column, valueIn]) => {
    if (valueIn !== undefined) {
      const values = Array.isArray(valueIn) ? valueIn : [valueIn];
      const newClauses = values.map(value => `${column} = ${escapeValue(value)}`);
      clauses.push(combineClauses(newClauses, 'OR'));
    }

    return clauses;
  }, []);
