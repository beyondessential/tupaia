/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from '@material-ui/lab/Skeleton';
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
  width: 140px;
  margin-right: 1rem;
`;

const Container = styled(FlexStart)`
  padding-top: 0.5rem;
  height: 70px;
  align-items: flex-start;
`;

const VitalName = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;
`;

const VitalContent = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-weight: 500;
  hyphens: auto;
  word-break: break-word;
`;

const GreenVital = styled(VitalContent)`
  color: ${props => props.theme.palette.success.main};
`;

const IconContainer = styled.div`
  width: 40px;
  margin-right: 10px;
`;

const VitalsIcon = ({ icon }) => {
  if (icon) {
    return (
      <IconContainer>
        {(() => {
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
        })()}
      </IconContainer>
    );
  }
  return null;
};

const VitalValue = ({ value, isLoading }) => {
  if (isLoading) {
    return <Skeleton animation="wave" />;
  }
  if (value === 'Yes') {
    return <GreenVital>{value}</GreenVital>;
  }
  return <VitalContent>{value || '-'}</VitalContent>;
};

export const EntityVitalsItem = ({ name, value, icon, isLoading }) => (
  <Container>
    <VitalsIcon icon={icon} />
    <Wrapper>
      <VitalName>{name}</VitalName>
      <VitalValue value={value} isLoading={isLoading} />
    </Wrapper>
  </Container>
);

EntityVitalsItem.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  isLoading: PropTypes.bool,
};

EntityVitalsItem.defaultProps = {
  value: '-',
  icon: '',
  isLoading: false,
};
