/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ImportModal } from '../importExport';
import { CreateButton as SingleCreateButton, BulkCreateButton } from '../editor';

const HeaderButtonContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 5px;
`;

const HeaderMain = styled.header``;

export const Header = ({
  importConfig,
  createConfig,
  exportConfig,
  ExportModalComponent,
  LinksComponent,
}) => {
  const CreateButton =
    createConfig && createConfig.bulkCreate ? BulkCreateButton : SingleCreateButton;

  return (
    <HeaderMain>
      <HeaderButtonContainer>
        {importConfig && <ImportModal {...importConfig} />}
        {createConfig && <CreateButton {...createConfig} />}
        {ExportModalComponent && <ExportModalComponent {...exportConfig} />}
        {LinksComponent && <LinksComponent />}
      </HeaderButtonContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  importConfig: PropTypes.object,
  createConfig: PropTypes.object,
  exportConfig: PropTypes.object,
  ExportModalComponent: PropTypes.elementType,
  LinksComponent: PropTypes.elementType,
};

Header.defaultProps = {
  importConfig: null,
  createConfig: null,
  exportConfig: {},
  ExportModalComponent: null,
  LinksComponent: null,
};
