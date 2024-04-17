/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { ImportModal } from '../importExport';
import { BulkCreateButton, CreateButton as SingleCreateButton } from '../editor';

const HeaderButtonContainer = styled.div`
  display: grid;
  grid-auto-flow: column;
  column-gap: 5px;
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

const capitalize = str => str[0].toUpperCase() + str.slice(1);

export const Header = ({
  resourceName,
  title,
  importConfig,
  createConfig,
  exportConfig,
  ExportModalComponent,
  LinksComponent,
}) => {
  const plural = resourceName?.plural ?? `${resourceName.singular}s`;
  const headerTitle = title ?? capitalize(plural);
  if (!!importConfig && !importConfig.title) {
    // eslint-disable-next-line no-param-reassign
    importConfig.title = `🆕 Import ${plural}`;
  }
  if (!!createConfig?.actionConfig && !createConfig.actionConfig.title) {
    // eslint-disable-next-line no-param-reassign
    createConfig.actionConfig.title = `🆕 New ${resourceName.singular}`;
  }

  const CreateButton =
    createConfig && createConfig.bulkCreate ? BulkCreateButton : SingleCreateButton;

  return (
    <HeaderMain>
      <MuiContainer maxWidth="xl">
        <HeaderInner>
          <Typography variant="h1">{headerTitle}</Typography>
          <HeaderButtonContainer>
            {importConfig && <ImportModal {...importConfig} />}
            {createConfig && <CreateButton {...createConfig} />}
            {ExportModalComponent && <ExportModalComponent {...exportConfig} />}
            {LinksComponent && <LinksComponent />}
          </HeaderButtonContainer>
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  );
};

Header.propTypes = {
  resourceName: PropTypes.shape({
    singular: PropTypes.string.isRequired,
    plural: PropTypes.string,
  }),
  title: PropTypes.string.isRequired,
  importConfig: PropTypes.object,
  createConfig: PropTypes.object,
  exportConfig: PropTypes.object,
  ExportModalComponent: PropTypes.elementType,
  LinksComponent: PropTypes.elementType,
};

Header.defaultProps = {
  resourceName: {},
  importConfig: null,
  createConfig: null,
  exportConfig: {},
  ExportModalComponent: null,
  LinksComponent: null,
};
