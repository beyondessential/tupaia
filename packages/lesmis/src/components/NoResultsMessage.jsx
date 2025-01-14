import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

const NoResultsBox = styled.div`
  text-align: center;
  padding: 1.5rem 1rem 2rem;

  img {
    width: 4.375rem;
    margin-bottom: 0.625rem;
  }
`;

const NoResultsText = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.625rem;
  font-size: 0.875rem;
`;

const NoResultsValue = styled.div`
  font-weight: 700;
`;

export const NoResultsMessage = ({ inputValue }) => {
  return (
    <NoResultsBox>
      <img src="/images/no-results-icon.svg" alt="no results" />
      <NoResultsText>No results found for the search</NoResultsText>
      <NoResultsValue>&quot;{inputValue}&quot;</NoResultsValue>
    </NoResultsBox>
  );
};

NoResultsMessage.propTypes = {
  inputValue: PropTypes.string.isRequired,
};
