/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import {
  Dialog,
  DialogHeader,
  DialogContent,
  FlexSpaceBetween as BaseFlexSpaceBetween,
  LoadingContainer,
} from '@tupaia/ui-components';
import { Button as MuiIconButton } from '@material-ui/core';
import { DashboardExportPreview } from './DashboardExportPreview';
import { OptionsBar } from './components';
import { useExportToPDF } from '../../utils';
import { useSubDashboards } from './utils/useSubDashboards';
import { ExportOptionsProvider } from './context/ExportOptionsContext';

const FlexSpaceBetween = styled(BaseFlexSpaceBetween)`
  width: 95%;
`;

const MuiButton = styled(MuiIconButton)`
  margin: 0px 20px;
`;

export const DashboardExportModal = ({ Button, title }) => {
  const fileName = `${title}-dashboards-export`;
  const { addToRefs, isExporting, exportToPDF } = useExportToPDF(fileName);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { subDashboards, totalPage } = useSubDashboards();

  const handleClickExport = async () => {
    await exportToPDF();
  };

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
        <ExportOptionsProvider>
          <DialogHeader onClose={() => setIsOpen(false)} title={title}>
            <FlexSpaceBetween>
              <MuiButton
                startIcon={<DownloadIcon />}
                variant="contained"
                color="primary"
                onClick={handleClickExport}
                disabled={isExporting}
              >
                Download
              </MuiButton>
              <OptionsBar totalPage={totalPage} setPage={setPage} isExporting={isExporting} />
            </FlexSpaceBetween>
          </DialogHeader>
          <DialogContent>
            <LoadingContainer heading="Exporting charts to PDF" isLoading={isExporting}>
              <DashboardExportPreview
                subDashboards={subDashboards}
                addToRefs={addToRefs}
                currentPage={page}
              />
            </LoadingContainer>
          </DialogContent>
        </ExportOptionsProvider>
      </Dialog>
      <Button onClick={() => setIsOpen(true)} />
    </>
  );
};

DashboardExportModal.propTypes = {
  title: PropTypes.string,
  Button: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

DashboardExportModal.defaultProps = {
  title: null,
  Button: null,
};
