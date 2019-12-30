/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { isMobile } from '../utils';
import { TRANS_BLACK_LESS, DARK_BLUE } from '../styles';

const BigLink = styled.a`
  display: inline-block;
  text-transform: uppercase;
  text-decoration: none;
  color: ${DARK_BLUE};
  margin-top: 10px;
  font-weight: 500;
`;

export const SignupColumn = ({ onClick }) => {
  if (isMobile()) {
    return <div />;
  }

  return (
    <div style={styles.info}>
      <h3 style={styles.infoHeader}>Need an account?</h3>
      <p style={styles.infoCopy}>
        Sign up to access more regions and assist in data collection using our free app for Android
        and iOS.
      </p>
      <BigLink
        href="#sign-up"
        onClick={e => {
          e.preventDefault();
          onClick();
        }}
      >
        Sign up
      </BigLink>
    </div>
  );
};

SignupColumn.propTypes = {
  onClick: PropTypes.func.isRequired,
};

const styles = {
  info: !isMobile()
    ? {
        display: 'table-cell',
        width: '45%',
        paddingRight: 20,
        verticalAlign: 'middle',
        borderRight: '1px solid #eee',
      }
    : {},
  infoHeader: {
    fontSize: 16,
    fontWeight: 500,
    margin: '0 0 10px 0',
  },
  infoCopy: {
    margin: 0,
    color: TRANS_BLACK_LESS,
  },
};

export default SignupColumn;
