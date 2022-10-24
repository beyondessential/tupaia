import Dialog from '@material-ui/core/Dialog';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import { cloneDeep } from 'lodash';
import EditIcon from 'material-ui/svg-icons/action/info';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

const EditButton = ({ dashboardItemCode }) => (
  // Big ol' hack for the hackathon!
  <a
    href={`https://hackathon-viz-workflow-admin.tupaia.org/dashboard-items?filters=[{"id":"code","value":"${dashboardItemCode}"}]`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <EditIcon />
  </a>
);
const DialogTitleWrapper = ({ titleText }) => {
  const styles = {
    titleText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'inherit',
      marginTop: '18px',
      marginBottom: '10px',
      gap: '3px',
    },
    dialogTitle: {
      textAlign: 'center',
      paddingBottom: 0,
    },
  };

  return (
    <DialogTitle style={styles.dialogTitle}>
      <span style={styles.titleText}>{titleText}</span>
    </DialogTitle>
  );
};

const BottomBar = styled.div`
  outline: 1px solid purple;
`;

const EditRow = styled.div`
  outline: 1px solid green;
  padding: 20px;
  display: flex;
`;

const EditRowTitle = styled.div`
  flex: 1;
`;
const EditRowActions = styled.div`
  flex: 0;
  display: block;
`;

const dialogTitle = 'Edit Dashboard';

export const EditDashboardModal = ({ dashboardSpec, isOpen, onClose, onSave }) => {
  const clonedDashboardSpec = cloneDeep(dashboardSpec);
  const [newDashboardSpec, setNewDashboardSpec] = useState(clonedDashboardSpec);

  console.log('clonedDashboardSpec', clonedDashboardSpec);
  console.log('newDashboardSpec', newDashboardSpec);

  const closeMeself = () => {
    // reset state
    setNewDashboardSpec(clonedDashboardSpec);
    // close modal
    onClose();
  };

  const rmDashboard = itemToRmCode => {
    console.log('itemToRmCode', itemToRmCode);
    const newItems = newDashboardSpec.items.filter(i => i.code !== itemToRmCode);
    setNewDashboardSpec({
      ...newDashboardSpec,
      items: newItems,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitleWrapper titleText={dialogTitle} />
      <div>
        {newDashboardSpec &&
          newDashboardSpec.items.map(item => (
            <EditRow>
              <EditRowTitle>{item.name}</EditRowTitle>
              <EditRowActions>
                <CloseIcon onClick={() => rmDashboard(item.code)} />
                <EditButton dashboardItemCode={item.code} />
              </EditRowActions>
            </EditRow>
          ))}
      </div>
      <BottomBar>
        <MuiButton onClick={() => onSave(newDashboardSpec)}>Save</MuiButton>
        <MuiButton onClick={() => closeMeself()}>Cancel</MuiButton>
      </BottomBar>
    </Dialog>
  );
};

EditDashboardModal.propTypes = {
  dashboardSpec: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
