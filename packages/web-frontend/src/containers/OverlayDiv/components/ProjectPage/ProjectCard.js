/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Lock from '@material-ui/icons/Lock';
import Alarm from '@material-ui/icons/Alarm';
import Button from '@material-ui/core/Button';

import { BOX_SHADOW, WHITE, LIGHT_GREY, FORM_BLUE, LIGHT_BLUE } from '../../../../styles';

const Card = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto auto;
  gap: 16px;
  padding-bottom: 16px;
  border-radius: 3px;
  text-align: center;
  position: relative;
  box-shadow: ${BOX_SHADOW};
  background: ${WHITE};
  color: #000000;
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 500;
  margin-top: -8px;
  padding: 0 16px;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  height: 120px;
  background: ${LIGHT_GREY}; /* fallback color */

  > img {
    width: 100%;
    height: 100%;
  }
`;

const Logo = styled.div`
  background: white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  position: absolute;
  width: 120px;
  height: 85px;
  bottom: -15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;

  > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const FullWidthRow = styled.div`
  grid-column: 1 / -1;
  padding: 0 16px;
`;

const Countries = styled(FullWidthRow)`
  margin-bottom: 8px;
  font-size: 14px;
  opacity: 0.7;
  padding: 0;
`;

const Footer = styled(FullWidthRow)`
  display: grid;
  align-content: end;
  padding: 0 16px;
`;

const LockIcon = styled(Lock)`
  margin-right: 5px;
`;

const AlarmIcon = styled(Alarm)`
  margin-right: 5px;
`;

const styles = {
  pendingAccessButton: {
    background: LIGHT_BLUE,
    color: FORM_BLUE,
    padding: '5px',
  },
  accessButton: {},
};

export const ProjectCard = ({
  name,
  description,
  imageUrl,
  logoUrl,
  names,
  projectAction,
  actionText,
  accessType,
  hasAccessPending,
}) => {
  return (
    <Card>
      <Header>
        <img alt="project background" src={imageUrl} />
        {logoUrl && (
          <Logo>
            <img alt="project logo" src={logoUrl} />
          </Logo>
        )}
      </Header>
      <Title>{name}</Title>
      <FullWidthRow>{description}</FullWidthRow>
      <Footer>
        <Countries>{name === 'Disaster Response' ? 'Global' : names.join(', ')}</Countries>
        <Button
          onClick={projectAction}
          color="primary"
          style={hasAccessPending ? styles.pendingAccessButton : styles.accessButton}
          variant={accessType || hasAccessPending ? 'contained' : 'outlined'}
        >
          {!accessType && !hasAccessPending && <LockIcon />}
          {hasAccessPending && <AlarmIcon />}
          {actionText}
        </Button>
      </Footer>
    </Card>
  );
};

ProjectCard.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  logoUrl: PropTypes.string,
  names: PropTypes.arrayOf(PropTypes.string).isRequired,
  projectAction: PropTypes.func.isRequired,
  actionText: PropTypes.string.isRequired,
  accessType: PropTypes.bool.isRequired,
  hasAccessPending: PropTypes.bool.isRequired,
};

ProjectCard.defaultProps = {
  logoUrl: '',
};
