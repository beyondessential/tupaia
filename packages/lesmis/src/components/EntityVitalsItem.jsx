import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import MuiBox from '@material-ui/core/Box';
import { LocationPin } from './Icons/LocationPin';
import { PushPin } from './Icons/PushPin';
import { SchoolCount } from './Icons/SchoolCount';
import { Group } from './Icons/Group';
import { Road } from './Icons/Road';
import { Study } from './Icons/Study';
import { Notepad } from './Icons/Notepad';
import { FlexStart } from './Layout';

const IconContainer = styled.div`
  width: 38px;
  height: 38px;
  margin-right: 9px;
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
              return <SchoolCount />;
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

VitalsIcon.propTypes = {
  icon: PropTypes.string.isRequired,
};

const VitalName = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 0.75rem;
  line-height: 140%;
`;

const VitalContent = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  hyphens: auto;
  word-break: break-word;
`;

const GreenVital = styled(VitalContent)`
  color: ${props => props.theme.palette.success.main};
`;

export const EntityVitalsItem = ({ name, value, icon, isLoading, ...props }) =>
  isLoading ? (
    <FlexStart>
      <Skeleton height={50} width={40} animation="wave" />
      <MuiBox pl={2} pr={3}>
        <Skeleton animation="wave" width={100} />
        <Skeleton animation="wave" width={50} />
      </MuiBox>
    </FlexStart>
  ) : (
    <FlexStart {...props}>
      <VitalsIcon icon={icon} />
      <div>
        <VitalName>{name}</VitalName>
        {value === 'Yes' ? (
          <GreenVital>{value}</GreenVital>
        ) : (
          <VitalContent>{value || '-'}</VitalContent>
        )}
      </div>
    </FlexStart>
  );

EntityVitalsItem.propTypes = {
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  isLoading: PropTypes.bool,
};

EntityVitalsItem.defaultProps = {
  name: null,
  value: '-',
  icon: '',
  isLoading: false,
};
