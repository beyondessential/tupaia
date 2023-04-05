/*
 * Tupaia
 *  Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Grid } from '@material-ui/core';
import {
  Dialog,
  DialogHeader,
  DialogContent as BaseDialogContent,
  CheckboxList,
  LoadingContainer,
  FlexEnd,
  DialogFooter as BaseDialogFooter,
  Button,
} from '@tupaia/ui-components';
import { useDashboardItemsExportToPDF } from '../utils/useDashboardItemsExportToPDF';
import { DARK_BLUE, PRIMARY_BLUE } from '../styles';
import { PrimaryButton as BasePrimaryButton } from '../components/Buttons';

const StyledRootGrid = styled(Grid)`
  justify-content: center;
  alignitems: center;
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

const PrimaryButton = styled(BasePrimaryButton)`
  text-transform: capitalize;
  margin-left: 1rem;
`;
const TextButton = styled(Button)`
  text-transform: capitalize;
  padding: 0.375rem 0.8rem;
  background-color: transparent;
  &:hover {
    background-color: ${props => props.theme.palette.action.hover};
  }
`;

const DialogFooter = styled(BaseDialogFooter)`
  padding-top: 0;
  padding-bottom: 2em;
  border-bottom: none;
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
    const defaultList = currentGroupDashboard.items.map((item, index) => {
      // at this stage, we only allow exporting charts
      const itemIsDisabled = item.type === 'view' || item.type === 'matrix';
      return {
        ...item,
        index,
        disabled: itemIsDisabled,
        tooltip: itemIsDisabled ? 'PDF export coming soon' : '',
      };
    });
    setList(defaultList);
    setSelectedItems([]);
  }, [currentGroupDashboard]);

  const { isExporting, exportToPDF, errorMessage, onReset } = useDashboardItemsExportToPDF(
    pathname,
  );

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
    <Dialog onClose={onClose} open={isOpen} maxWidth="md">
      <DialogHeader onClose={onClose} />
      <DialogContent>
        <LoadingContainer
          heading="Exporting charts to PDF"
          isLoading={isExporting}
          errorMessage={errorMessage}
          onReset={onReset}
        >
          <StyledRootGrid container>
            <Grid item xs={10}>
              <CheckboxList
                list={list}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                title="Select Visualisation"
              />
            </Grid>
          </StyledRootGrid>
        </LoadingContainer>
      </DialogContent>
      <DialogFooter>
        <StyledRootGrid container>
          <Grid item xs={10}>
            <FlexEnd>
              <TextButton onClick={onClose} disableElevation>
                Cancel
              </TextButton>
              <PrimaryButton
                variant="contained"
                onClick={exportSelectedItems}
                disableElevation
                disabled={isExporting}
              >
                Download
              </PrimaryButton>
            </FlexEnd>
          </Grid>
        </StyledRootGrid>
      </DialogFooter>
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
