/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useData } from '../../hooks/useData';
import { Column } from './Column';

export const RecursiveColumn = ({ data, isLoading, error, fetchData, readOnly }) => {
  const {
    data: children,
    isLoading: areChildrenLoading,
    error: childrenError,
    clearData: clearChildren,
    fetchData: fetchChildren,
  } = useData(fetchData);

  useEffect(() => {
    clearChildren();
  }, [data]);

  const isExpanded = !!(children || areChildrenLoading || childrenError);

  return (
    <>
      <Column
        data={data}
        isLoading={isLoading}
        error={error}
        onSelect={() => {
          clearChildren();
        }}
        onExpand={node => {
          fetchChildren(node);
        }}
        isExpanded={isExpanded}
        readOnly={readOnly}
      />
      {isExpanded && (
        <RecursiveColumn
          data={children}
          isLoading={areChildrenLoading}
          error={childrenError}
          fetchData={fetchData}
          readOnly={readOnly}
        />
      )}
    </>
  );
};

RecursiveColumn.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ),
  isLoading: PropTypes.bool,
  readOnly: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
  }),
  fetchData: PropTypes.func.isRequired,
};

RecursiveColumn.defaultProps = {
  data: undefined,
  isLoading: false,
  error: null,
  readOnly: false,
};
