/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ImportButton } from '../importExport';
import { CreateButton } from '../editor';

const HeaderButtonContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 20px;
`;

const HeaderMain = styled.header`
  background-color: ${props => props.theme.palette.primary.main};
  color: white;
`;

const HeaderInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 190px;
  padding-bottom: 1.25rem;
`;

export const Header = ({ title, importConfig, createConfig }) => (
  <HeaderMain>
    <MuiContainer maxWidth="lg">
      <HeaderInner>
        <Typography variant="h1">{title}</Typography>
        <HeaderButtonContainer>
          {importConfig && <ImportButton {...importConfig} />}
          {createConfig && <CreateButton {...createConfig} />}
        </HeaderButtonContainer>
      </HeaderInner>
    </MuiContainer>
  </HeaderMain>
);

Header.propTypes = {
  title: PropTypes.string.isRequired,
  importConfig: PropTypes.object,
  createConfig: PropTypes.object,
};

Header.defaultProps = {
  importConfig: null,
  createConfig: null,
};
