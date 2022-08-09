/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import {
  Dialog,
  DialogHeader,
  DialogContent as BaseDialogContent,
  FlexSpaceBetween as BaseFlexSpaceBetween,
} from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/Button';
import { useDashboardItemsExportToPDF } from '../utils/useDashboardItemsExportToPDF';

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

export const DashboardExportModal = ({ title, isOpen, setIsOpen, pathname, exportFileName }) => {
  const { isExporting, exportToPDF, errorMessage, onReset } = useDashboardItemsExportToPDF(
    pathname,
  );
  const handleClickExport = async () => {
    await exportToPDF(exportFileName);
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
            disabled={isExporting}
          >
            download
          </MuiButton>
        </FlexSpaceBetween>
      </DialogHeader>
      <DialogContent>123</DialogContent>
    </Dialog>
  );
};

DashboardExportModal.propTypes = {
  title: PropTypes.string,
  exportFileName: PropTypes.string.isRequired,
  pathname: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

DashboardExportModal.defaultProps = {
  title: null,
  pathname: '',
};

const mapStateToProps = (state, ownProps) => {
  const { pathname } = state.routing;
  return { pathname: pathname.substring(1), ...ownProps };
};

export default connect(mapStateToProps)(DashboardExportModal);
