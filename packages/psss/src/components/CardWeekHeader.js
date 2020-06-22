/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import PropTypes from 'prop-types';
import { PercentageChangeCell } from './Table';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
`;

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.theme.palette.text.primary};
`;

const Subheading = styled(Heading)`
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;

const SuperText = styled(Typography)`
  font-weight: 600;
  font-size: 0.6875rem;
  line-height: 1rem;
  text-transform: uppercase;
  color: ${props => props.theme.palette.text.secondary};
`;

const HighlightText = styled(PercentageChangeCell)`
  font-size: 1rem;
  line-height: 1rem;
  margin-left: 0.4rem;
  font-weight: 500;
`;

export const CardWeekHeader = ({ heading, subheading, detailText, percentageChange }) => (
  <Wrapper>
    <div>
      <Heading>{heading}</Heading>
      <Subheading>{subheading}</Subheading>
    </div>
    <div>
      <FlexRow>
        <SuperText>Prev.Week</SuperText>
        <HighlightText percentageChange={percentageChange} />
      </FlexRow>
      <Text>{detailText}</Text>
    </div>
  </Wrapper>
);

CardWeekHeader.propTypes = {
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
  detailText: PropTypes.string.isRequired,
  percentageChange: PropTypes.number.isRequired,
};
