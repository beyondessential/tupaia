/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ReactComponent as LocationPin } from './icons/location-pin.svg';
import { ReactComponent as PushPin } from './icons/push-pin.svg';
import { ReactComponent as School } from './icons/school-count.svg';
import { ReactComponent as Group } from './icons/group.svg';
import { ReactComponent as Road } from './icons/road.svg';
import { ReactComponent as Study } from './icons/study.svg';
import { ReactComponent as Notepad } from './icons/notepad.svg';
import { FlexStart } from './Layout';

const Wrapper = styled.section`
  padding-top: 0.5rem;
`;

const Container = styled(FlexStart)`
  width: 200px;
  height: 70px;
`;

const VitalName = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;
`;

const VitalContent = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-weight: bold;
`;

const VitalsIcon = ({ icon }) => {
  switch (icon) {
    case 'LocationPin':
      return <LocationPin />;
    case 'Group':
      return <Group />;
    case 'School':
      return <School />;
    case 'Study':
      return <Study />;
    case 'Road':
      return <Road />;
    case 'PushPin':
      return <PushPin />;
    case 'Notepad':
      return <Notepad />;
    default:
      return null;
  }
};

export const EntityVitalsItem = ({ name, value, icon }) => (
  <Container>
    <VitalsIcon icon={icon} />
    <Wrapper>
      <VitalName>{name}</VitalName>
      <VitalContent>{value}</VitalContent>
    </Wrapper>
  </Container>
);

EntityVitalsItem.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  icon: PropTypes.string,
};

EntityVitalsItem.defaultProps = {
  icon: '',
};
