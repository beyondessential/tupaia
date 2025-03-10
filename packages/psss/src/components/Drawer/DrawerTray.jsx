import React from 'react';
import styled from 'styled-components';
import { Close } from '@material-ui/icons';
import { LightIconButton } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import * as COLORS from '../../constants';

const Tray = styled.div`
  background: ${props => props.color};
  color: white;
  padding: 0.2rem 1.25rem 0.5rem;
`;

const TrayInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
`;

const TrayHeading = styled.span`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;

  svg {
    margin-right: 1rem;
  }
`;

export const DrawerTray = ({ heading, Icon, color, onClose }) => (
  <Tray color={color}>
    <TrayInner>
      <TrayHeading>
        {Icon && <Icon />} {heading}
      </TrayHeading>
      <LightIconButton onClick={onClose}>
        <Close />
      </LightIconButton>
    </TrayInner>
  </Tray>
);

DrawerTray.propTypes = {
  heading: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  Icon: PropTypes.node,
  color: PropTypes.string,
};

DrawerTray.defaultProps = {
  Icon: null,
  color: COLORS.BLUE,
};
