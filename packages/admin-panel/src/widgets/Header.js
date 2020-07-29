/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { HeaderButtons, Title, Header as HeaderComponent } from '../pages/Page';
import { ImportButton } from '../importExport';
import { CreateButton } from '../editor';

export const Header = ({ title, importConfig, createConfig }) => (
  <HeaderComponent>
    <Title>{title}</Title>
    <HeaderButtons>
      {importConfig && <ImportButton {...importConfig} />}
      {createConfig && <CreateButton {...createConfig} />}
    </HeaderButtons>
  </HeaderComponent>
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
