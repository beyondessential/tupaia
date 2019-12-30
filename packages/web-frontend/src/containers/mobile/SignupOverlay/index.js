/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Overlay from '../../../components/mobile/Overlay';
import { SignupForm } from '../../SignupForm';
import { DARK_BLUE } from '../../../styles';

const OverlayComponent = styled(Overlay)`
  background: ${DARK_BLUE};
`;

export const SignupOverlay = ({ closeSignupOverlay }) => {
  return (
    <OverlayComponent
      onClose={closeSignupOverlay}
      contentStyle={{ background: DARK_BLUE }}
      titleText="Sign up"
    >
      <SignupForm onClickCancel={closeSignupOverlay} />
    </OverlayComponent>
  );
};

SignupOverlay.propTypes = {
  closeSignupOverlay: PropTypes.func.isRequired,
};
