import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { HorizontalTree } from '@tupaia/ui-components';
import { PageBody, PageHeader } from '../../widgets';
import { LogsModal } from '../../logsTable';
import { generateTitle } from './resourceName';

const Container = styled(PageBody)`
  overflow: auto;
`;

const StyledHorizontalTree = styled(HorizontalTree)`
  color: ${({ theme }) => theme.palette.text.primary};
  height: 930px;
  margin-block: 40px;
  max-block-size: 870px;
`;

export const TreeResourcePage = ({
  resourceName,
  title,
  fetchRoot,
  fetchBranch,
  ExportModalComponent,
}) => {
  return (
    <>
      <Container>
        <PageHeader
          title={title ?? generateTitle(resourceName)}
          ExportModalComponent={ExportModalComponent}
        />
        <StyledHorizontalTree fetchRoot={fetchRoot} fetchBranch={fetchBranch} />
      </Container>
      <LogsModal />
    </>
  );
};

TreeResourcePage.defaultProps = {
  resourceName: {},
  ExportModalComponent: null,
  title: '',
};

TreeResourcePage.propTypes = {
  resourceName: PropTypes.shape({
    singular: PropTypes.string.isRequired,
    plural: PropTypes.string,
  }),
  title: PropTypes.string,
  fetchRoot: PropTypes.func.isRequired,
  fetchBranch: PropTypes.func.isRequired,
  ExportModalComponent: PropTypes.elementType,
};
