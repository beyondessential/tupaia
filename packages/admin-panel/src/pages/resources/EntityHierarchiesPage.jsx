/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import React from 'react';
import PropTypes from 'prop-types';

import { getSortByKey } from '@tupaia/utils';
import { get } from '../../VizBuilderApp/api';
import { TreeResourcePage } from './TreeResourcePage';

const fetchRoot = async () => get('hierarchies');

const fetchBranch = async (rootNode, node) => {
  const { code: hierarchyName } = rootNode;
  const { code: entityCode } = node;

  const descendants = await get(`hierarchy/${hierarchyName}/${entityCode}/descendants?`, {
    params: {
      fields: ['id', 'code', 'name', 'parent_code'].join(','),
      filter: 'generational_distance<=2',
    },
  });

  descendants.sort(getSortByKey('name'));
  const descendantsByParent = groupBy(descendants, 'parent_code');
  const children = descendantsByParent[entityCode] || [];

  return children.map(({ id, code, name }) => ({
    id,
    code,
    name,
    children: (descendantsByParent[code] || []).map(descendant => ({
      id: descendant.id,
    })),
  }));
};

export const EntityHierarchiesPage = ({ getHeaderEl }) => (
  <TreeResourcePage
    title="Entity Hierarchies"
    fetchRoot={fetchRoot}
    fetchBranch={fetchBranch}
    getHeaderEl={getHeaderEl}
  />
);

EntityHierarchiesPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
