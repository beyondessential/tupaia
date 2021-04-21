/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import {
  PinDrop,
  People,
  School,
  LocalLibrary,
  Assignment,
  Map,
  LocationOn,
} from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';

const Wrapper = styled.section`
  padding-top: 0.5rem;
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
`;

const Container = styled(MuiContainer)`
  display: flex;
  flex-direction: row;
  width: 30%;
  margin-left: 0;
  margin-right: 0;
`;

const VitalName = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;
`;

const VitalContent = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-weight: bold;
`;

const StyledPinDrop = styled(PinDrop)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;
const StyledPeople = styled(People)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;
const StyledSchool = styled(School)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;
const StyledLocalLibrary = styled(LocalLibrary)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;
const StyledMap = styled(Map)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;
const StyledLocationOn = styled(LocationOn)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;
const StyledAssignment = styled(Assignment)`
  padding-top: 0.5rem;
  font-size: 2.5rem;
  color: ${props => props.theme.palette.text.secondary};
`;

const getIcon = icon => {
  switch (icon) {
    case 'PinDrop':
      return <StyledPinDrop />;
    case 'People':
      return <StyledPeople />;
    case 'School':
      return <StyledSchool />;
    case 'LocalLibrary':
      return <StyledLocalLibrary />;
    case 'Map':
      return <StyledMap />;
    case 'LocationOn':
      return <StyledLocationOn />;
    case 'Assignment':
    default:
      return <StyledAssignment />;
  }
};

export const EntityVitalsItem = ({ name, value, icon }) => {
  return (
    <Container>
      {getIcon(icon)}
      <Wrapper>
        <VitalName>{name}</VitalName>
        <VitalContent>{value}</VitalContent>
      </Wrapper>
    </Container>
  );
};

EntityVitalsItem.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

EntityVitalsItem.defaultProps = {
  icon: '',
};
