import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFetch } from '../../hooks/useFetch';
import { Column } from './Column';

export const RecursiveColumn = ({ data, isLoading, error, fetchData, readOnly }) => {
  const childQuery = useFetch(fetchData);
  const isExpanded = childQuery.isTriggered;

  useEffect(() => {
    childQuery.clearData();
  }, [data]);

  return (
    <>
      <Column
        data={data}
        isLoading={isLoading}
        error={error}
        onSelect={() => {
          childQuery.clearData();
        }}
        onExpand={node => {
          childQuery.fetchData(node);
        }}
        isExpanded={isExpanded}
        readOnly={readOnly}
      />
      {isExpanded && (
        <RecursiveColumn
          data={childQuery.data}
          isLoading={childQuery.isLoading}
          error={childQuery.error}
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
