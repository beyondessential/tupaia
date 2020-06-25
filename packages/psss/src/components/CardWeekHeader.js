/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { WarningCloud, Virus } from '@tupaia/ui-components';
import React from 'react';
import PropTypes from 'prop-types';
import { PercentageChangeCell } from './Table';
import { FlexRow, FlexSpaceBetween } from './Layout';

const ExpandableWrapper = styled(MuiExpansionPanelSummary)`
  padding: 0;

  .MuiExpansionPanelSummary-content {
    display: block;
  }

  .MuiExpansionPanelSummary-content {
    margin: 0;
  }

  .Mui-expanded {
    .psss-card-header-bar {
      background: #ef5a06;
      border: 1px solid rgba(239, 90, 6, 0.15);
      color: white;
    }
  }
`;

// .psss-card-header-bar
const HeaderBar = styled(FlexSpaceBetween)`
  background: #ffece1;
  color: #ef5a06;
  border: 1px solid rgba(239, 90, 6, 0.15);
  padding: 5px 12px;
  transition: color 0.3s ease, background-color 0.3s ease;

  svg {
    font-size: 16px;
  }
`;

const Row = styled(FlexRow)`
  font-weight: 600;
  font-size: 11px;
  line-height: 13px;
  text-transform: uppercase;

  svg {
    margin-right: 0.3rem;
  }
`;

const HeaderDetails = styled(FlexSpaceBetween)`
  padding: 1rem;
  margin: 0;
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  border-left: 1px solid ${props => props.theme.palette.grey['400']};
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

const FlexEnd = styled.div`
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
  <ExpandableWrapper>
    <HeaderBar className="psss-card-header-bar">
      <Row>
        <WarningCloud />
        Alert
      </Row>
      <AddCircleIcon />
    </HeaderBar>
    <HeaderDetails>
      <div>
        <Heading>{heading}</Heading>
        <Subheading>{subheading}</Subheading>
      </div>
      <div>
        <FlexEnd>
          <SuperText>Prev.Week</SuperText>
          <HighlightText percentageChange={percentageChange} />
        </FlexEnd>
        <Text>{detailText}</Text>
      </div>
    </HeaderDetails>
  </ExpandableWrapper>
);

CardWeekHeader.propTypes = {
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
  detailText: PropTypes.string.isRequired,
  percentageChange: PropTypes.number.isRequired,
};
