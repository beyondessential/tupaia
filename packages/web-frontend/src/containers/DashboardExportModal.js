/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import DownloadIcon from '@material-ui/icons/GetApp';
import {
  Dialog,
  DialogHeader,
  DialogContent as BaseDialogContent,
  FlexSpaceBetween as BaseFlexSpaceBetween,
  CheckboxList,
  LoadingContainer,
} from '@tupaia/ui-components';
import MuiIconButton from '@material-ui/core/Button';
import { useDashboardItemsExportToPDF } from '../utils/useDashboardItemsExportToPDF';
import { DARK_BLUE, PRIMARY_BLUE } from '../styles';

const FlexSpaceBetween = styled(BaseFlexSpaceBetween)`
  width: 95%;
`;

const DialogContent = styled(BaseDialogContent)`
  .MuiCheckbox-colorSecondary.Mui-checked {
    color: ${PRIMARY_BLUE};
  }

  .loading-screen {
    background: ${DARK_BLUE};
    border: 0;
  }
`;

const MuiButton = styled(MuiIconButton)`
  margin: 0px 20px;
  background-color: transparent;
`;

export const DashboardExportModal = ({
  isOpen,
  setIsOpen,
  pathname,
  exportFileName,
  currentGroupDashboard,
}) => {
  if (!currentGroupDashboard) return null;

  const [list, setList] = React.useState([]);
  const [selectedItems, setSelectedItems] = React.useState([]);

  useEffect(() => {
    const defaultList = currentGroupDashboard.items.map((item, index) => ({ ...item, index }));
    setList(defaultList);
    setSelectedItems([]);
  }, [currentGroupDashboard]);

  const { isExporting, exportToPDF, errorMessage, onReset } =
    useDashboardItemsExportToPDF(pathname);

  const exportSelectedItems = async () => {
    const selectedDashboardItems = selectedItems
      .sort((a, b) => a.index - b.index)
      .map(item => item.code);
    await exportToPDF(exportFileName, { selectedDashboardItems: selectedDashboardItems.join(',') });
  };
  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog onClose={onClose} open={isOpen} maxWidth="lg">
      <DialogHeader onClose={onClose}>
        <FlexSpaceBetween>
          <MuiButton
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={exportSelectedItems}
            disableElevation
            disabled={isExporting}
          >
            export
          </MuiButton>
        </FlexSpaceBetween>
      </DialogHeader>
      <DialogContent>
        <LoadingContainer
          heading="Exporting charts to PDF"
          isLoading={isExporting}
          errorMessage={errorMessage}
          onReset={onReset}
        >
          <CheckboxList
            list={list}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            title="Visualisation"
          />
        </LoadingContainer>
      </DialogContent>
    </Dialog>
  );
};

DashboardExportModal.propTypes = {
  exportFileName: PropTypes.string.isRequired,
  pathname: PropTypes.string,
  currentGroupDashboard: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};

DashboardExportModal.defaultProps = {
  pathname: '',
  currentGroupDashboard: null,
};

const mapStateToProps = (state, ownProps) => {
  const { pathname } = state.routing;

  return { pathname: pathname.substring(1), ...ownProps };
};

export default connect(mapStateToProps)(DashboardExportModal);
