import React, { useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
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
import { OptionsBar } from './components';
import {
  I18n,
  useDashboardItemsExportToPDF,
  useUrlParams,
  useUrlSearchParam,
  useDashboardDropdownOptions,
} from '../../utils';
import { DEFAULT_DATA_YEAR } from '../../constants';
import { DASHBOARD_EXPORT_PREVIEW, ExportView as BaseExportView } from '../../views/ExportView';

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

const ExportView = styled(BaseExportView)`
  ${p =>
    p.$isLoading // if loading, make it smaller than user's window so loading status is centred
      ? `
        height: 50vh;
        min-height: 0;
        overflow: hidden;
        `
      : ''}
`;

export const DashboardExportModal = ({ title, totalPage, isOpen, setIsOpen }) => {
  const [exportWithLabels, setExportWithLabels] = useState(null);
  const [exportWithTable, setExportWithTable] = useState(null);
  const [selectedYear] = useUrlSearchParam('year', DEFAULT_DATA_YEAR);
  const { selectedOption } = useDashboardDropdownOptions();
  const { locale, entityCode } = useUrlParams();

  const toggleExportWithLabels = () => {
    setExportWithLabels(exportWithLabels ? null : true);
  };
  const toggleExportWithTable = () => {
    setExportWithTable(exportWithTable ? null : true);
  };

  const fileName = `${title}-${selectedOption.value}-dashboards-export`;
  const { isExporting, exportToPDF, errorMessage, onReset } = useDashboardItemsExportToPDF({
    exportWithLabels,
    exportWithTable,
    year: selectedYear,
    locale,
    entityCode,
    dashboard: selectedOption.value,
  });

  const isFetching = useIsFetching() > 0;
  const isError = !!errorMessage;
  const isDisabled = isError || isExporting || isFetching;
  const [page, setPage] = useState(1);

  const handleClickExport = async () => {
    await exportToPDF(fileName);
  };
  const onClose = () => {
    setIsOpen(false);
    setPage(1);
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
            exportOptions={{
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
          errorMessage={errorMessage}
          onReset={onReset}
        >
          <ExportView
            $isLoading={isDisabled}
            viewType={DASHBOARD_EXPORT_PREVIEW}
            viewProps={{
              currentPage: page,
              isExporting,
              isError,
              exportOptions: {
                exportWithLabels,
                exportWithTable,
              },
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
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

DashboardExportModal.defaultProps = {
  title: null,
  totalPage: 1,
};
