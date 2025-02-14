import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { Card, WarningCloud, Virus } from '@tupaia/ui-components';
import { PercentageChangeCell } from './Table';
import { FlexStart, FlexEnd, FlexSpaceBetween } from './Layout';
import * as COLORS from '../constants/colors';

const StyledCard = styled(Card)`
  border: none;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:hover {
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

export const AlertsOutbreaksCard = ({ children, ...props }) => (
  <StyledCard variant="outlined" {...props}>
    <MuiExpansionPanel>{children}</MuiExpansionPanel>
  </StyledCard>
);

AlertsOutbreaksCard.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AlertsAndOutbreaksCardBody = styled(MuiExpansionPanelDetails)`
  padding: 0;
  border-left: 1px solid ${props => props.theme.palette.grey['400']};
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
`;

const ORANGE_BORDER_COLOR = 'rgba(239, 90, 6, 0.15)';
const RED_BORDER_COLOR = 'rgba(209, 51, 51, 0.15)';

const BaseWrapper = styled(MuiExpansionPanelSummary)`
  padding: 0;

  .MuiExpansionPanelSummary-content {
    display: block;
  }

  .MuiExpansionPanelSummary-content {
    margin: 0;
  }

  .psss-open-icon {
    display: block;
  }
  .psss-close-icon {
    display: none;
  }

  .Mui-expanded {
    .psss-open-icon {
      display: none;
    }
    .psss-close-icon {
      display: block;
    }
    .psss-card-header-bar {
      background: ${COLORS.ORANGE};
      border: 1px solid ${ORANGE_BORDER_COLOR};
      color: white;
    }
  }
`;

const AlertWrapper = styled(BaseWrapper)`
  .psss-card-header-bar {
    background: ${COLORS.LIGHT_ORANGE};
    color: ${COLORS.ORANGE};
    border: 1px solid ${ORANGE_BORDER_COLOR};
  }

  .Mui-expanded {
    .psss-card-header-bar {
      background: ${COLORS.ORANGE};
      border: 1px solid ${COLORS.ORANGE};
      color: white;
    }
  }
`;

const OutbreakWrapper = styled(BaseWrapper)`
  .psss-card-header-bar {
    background: ${COLORS.LIGHT_RED};
    color: ${COLORS.RED};
    border: 1px solid ${RED_BORDER_COLOR};
  }

  .Mui-expanded {
    .psss-card-header-bar {
      background: ${COLORS.RED};
      border: 1px solid ${COLORS.RED};
      color: white;
    }
  }
`;

// .psss-card-header-bar
const HeaderBar = styled(FlexSpaceBetween)`
  padding: 0.3rem 0.75rem;
  transition: color 0.3s ease, background-color 0.3s ease, border 0.3s ease;

  svg {
    font-size: 1rem;
  }
`;

const Row = styled(FlexStart)`
  font-weight: 600;
  font-size: 0.6875rem;
  line-height: 0.8rem;
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

const TYPES = {
  ALERT: 'alert',
  OUTBREAK: 'outbreak',
};

export const AlertsOutbreaksCardHeader = ({
  heading,
  subheading,
  detailText,
  percentageChange,
  type,
}) => {
  const Wrapper = type === 'alert' ? AlertWrapper : OutbreakWrapper;
  return (
    <Wrapper>
      <HeaderBar className="psss-card-header-bar">
        <Row>
          {type === TYPES.OUTBREAK ? <Virus /> : <WarningCloud />}
          {type === TYPES.OUTBREAK ? 'Outbreak' : 'Alert'}
        </Row>
        <RemoveCircleIcon className="psss-close-icon" />
        <AddCircleIcon className="psss-open-icon" />
      </HeaderBar>
      <HeaderDetails>
        <div>
          <Heading>{heading}</Heading>
          <Subheading>{subheading}</Subheading>
        </div>
        <div>
          <FlexEnd mb={1}>
            <SuperText>Prev. Week</SuperText>
            <HighlightText percentageChange={percentageChange} />
          </FlexEnd>
          <Text>{detailText}</Text>
        </div>
      </HeaderDetails>
    </Wrapper>
  );
};

AlertsOutbreaksCardHeader.propTypes = {
  type: PropTypes.oneOf([TYPES.ALERT, TYPES.OUTBREAK]),
  heading: PropTypes.string.isRequired,
  subheading: PropTypes.string.isRequired,
  detailText: PropTypes.string.isRequired,
  percentageChange: PropTypes.number.isRequired,
};

AlertsOutbreaksCardHeader.defaultProps = {
  type: TYPES.ALERT,
};
