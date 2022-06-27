/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useIsFetching } from 'react-query';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import {
  Dialog,
  DialogHeader,
  DialogContent as BaseDialogContent,
  FlexSpaceBetween as BaseFlexSpaceBetween,
  LoadingContainer,
} from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/Button';
import { DashboardExportPreview } from './DashboardExportPreview';
import { OptionsBar } from './components';
import { I18n, useExportToPDF } from '../../utils';

const FlexSpaceBetween = styled(BaseFlexSpaceBetween)`
  width: 95%;
`;

const DialogContent = styled(BaseDialogContent)`
  background-color: white;
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
  const [exportWithLabels, setExportWithLabels] = useState(false);
  const [exportWithTable, setExportWithTable] = useState(false);

  const toggleExportWithLabels = () => {
    setExportWithLabels(!exportWithLabels);
  };
  const toggleExportWithTable = () => {
    setExportWithTable(!exportWithTable);
  };

  const fileName = `${title}-dashboards-export`;
  const { addToRefs, isExporting, exportToPDF } = useExportToPDF(fileName);
  const isFetching = useIsFetching() > 0;
  const isDisabled = isExporting || isFetching;
  const [page, setPage] = useState(1);

  const handleClickExport = async () => {
    await exportToPDF();
  };
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog onClose={onClose} open={isOpen} maxWidth="lg">
      <DialogHeader onClose={onClose} title={title}>
        <FlexSpaceBetween>
          <MuiButton
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleClickExport}
            disableElevation
            disabled={isDisabled}
          >
            <I18n t="dashboards.download" />
          </MuiButton>
          <OptionsBar
            totalPage={totalPage}
            page={page}
            setPage={setPage}
            isDisabled={isDisabled}
            useExportOptions={{
              exportWithLabels,
              exportWithTable,
              toggleExportWithLabels,
              toggleExportWithTable,
            }}
          />
        </FlexSpaceBetween>
      </DialogHeader>
      <DialogContent>
        <LoadingContainer
          heading={I18n({
            t: isFetching ? 'dashboards.fetchingAllReportsData' : 'dashboards.exportingChartsToPDF',
          })}
          text={I18n({ t: 'dashboards.pleaseDoNotRefreshTheBrowserOrCloseThisPage' })}
          isLoading={isDisabled}
        >
          <DashboardExportPreview
            exportableDashboards={exportableDashboards}
            addToRefs={addToRefs}
            currentPage={page}
            isExporting={isExporting}
            useExportOptions={{
              exportWithLabels,
              exportWithTable,
            }}
          />
        </LoadingContainer>
      </DialogContent>
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
