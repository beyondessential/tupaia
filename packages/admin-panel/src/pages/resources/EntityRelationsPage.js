/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TreeResourcePage } from './TreeResourcePage';

export const EntityRelationsPage = ({ getHeaderEl }) => (
  <TreeResourcePage
    title="Entity Relations"
    endpoint="entityHierarchyTree"
    nodeKey="code"
    getHeaderEl={getHeaderEl}
  />
);

EntityRelationsPage.propTypes = {
  getHeaderEl: PropTypes.func.isRequired,
};
