/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

const TYPE_HEADINGS = {
  question: 'Questions',
};

const renderUsedByList = usedBy => {
  const types = [...new Set(usedBy.map(item => item.type))];
  return types.map(type =>
    renderUsedByGroup(
      type,
      usedBy.filter(item => item.type === type),
    ),
  );
};

const renderUsedByGroup = (type, items) => (
  <div key={type}>
    <h7>{TYPE_HEADINGS[type] ?? type}</h7>
    <ul>
      {items.map(item => (
        <li key={item.url}>
          <a href={item.url}>{item.name}</a>
        </li>
      ))}
    </ul>
  </div>
);

export const UsedBy = ({ usedBy, isLoading, errorMessage }) => (
  <>
    <Typography variant="h6" gutterBottom>
      Used by {!isLoading && !errorMessage && <>({usedBy.length})</>}
    </Typography>
    {isLoading && <>Loading...</>}
    {!isLoading && errorMessage && <>Failed to load used by: {errorMessage}</>}
    {!isLoading && !errorMessage && (
      <Card>
        <CardContent>{renderUsedByList(usedBy)}</CardContent>
      </Card>
    )}
  </>
);

UsedBy.defaultProps = {
  isLoading: false,
  errorMessage: null,
};

UsedBy.propTypes = {
  usedBy: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};
