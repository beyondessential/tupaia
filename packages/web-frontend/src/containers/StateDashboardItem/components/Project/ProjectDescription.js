/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { WHITE } from '../../../../styles';
import { selectActiveProjectCode, selectProjectByCode } from '../../../../selectors';

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto auto;
  text-align: center;
  position: relative;
  background: #272832;
  color: ${WHITE};
`;

const FullWidthRow = styled.div`
  grid-column: 1 / -1;
  padding: 16px;
`;

const Countries = styled(FullWidthRow)`
  font-size: 14px;
  opacity: 0.7;
  padding: 0;
`;

const Footer = styled(FullWidthRow)`
  display: grid;
  align-content: end;
`;

function ProjectDescription({ project }) {
  return (
    <Grid>
      <FullWidthRow>{project.description}</FullWidthRow>
      <Footer>
        <Countries>{project.names.join(', ')}</Countries>
      </Footer>
    </Grid>
  );
}

ProjectDescription.propTypes = {
  project: PropTypes.shape({}).isRequired,
};

const mapStateToProps = state => {
  const activeProjectCode = selectActiveProjectCode(state);
  const project = selectProjectByCode(state, activeProjectCode);

  return {
    project,
  };
};

export default connect(mapStateToProps)(ProjectDescription);
