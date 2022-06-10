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
import MuiIconButton from '@material-ui/core/Button';
import { DashboardExportPreview } from './DashboardExportPreview';
import { OptionsBar } from './components';
import { I18n, useExportToPDF } from '../../utils';
import { ExportOptionsProvider } from './context/ExportOptionsContext';

const FlexSpaceBetween = styled(BaseFlexSpaceBetween)`
  width: 95%;
`;

const MuiButton = styled(MuiIconButton)`
  margin: 0px 20px;
  background-color: transparent;
  color: #666666;
`;

export const DashboardExportModal = ({
  title,
  exportableDashboards,
  totalPage,
  isOpen,
  setIsOpen,
}) => {
  const fileName = `${title}-dashboards-export`;
  const { addToRefs, isExporting, exportToPDF } = useExportToPDF(fileName);
  const [page, setPage] = useState(1);

  const handleClickExport = async () => {
    await exportToPDF();
  };

  return (
    <Dialog onClose={() => setIsOpen(false)} open={isOpen} maxWidth="lg">
      <ExportOptionsProvider>
        <DialogHeader onClose={() => setIsOpen(false)} title={title}>
          <FlexSpaceBetween>
            <MuiButton
              startIcon={<DownloadIcon />}
              variant="outlined"
              onClick={handleClickExport}
              disableElevation
              disabled={isExporting}
            >
              <I18n t="dashboards.download" />
            </MuiButton>
            <OptionsBar totalPage={totalPage} setPage={setPage} isExporting={isExporting} />
          </FlexSpaceBetween>
        </DialogHeader>
        <DialogContent>
          <LoadingContainer
            heading={I18n({ t: 'dashboards.exportingChartsToPDF' })}
            text={I18n({ t: 'dashboards.pleaseDoNotRefreshTheBrowserOrCloseThisPage' })}
            isLoading={isExporting}
          >
            <DashboardExportPreview
              exportableDashboards={exportableDashboards}
              addToRefs={addToRefs}
              currentPage={page}
            />
          </LoadingContainer>
        </DialogContent>
      </ExportOptionsProvider>
    </Dialog>
  );
};

DashboardExportModal.propTypes = {
  title: PropTypes.string,
  totalPage: PropTypes.number,
  exportableDashboards: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

DashboardExportModal.defaultProps = {
  title: null,
  totalPage: 1,
  exportableDashboards: [],
};
