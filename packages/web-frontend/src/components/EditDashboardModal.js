import Dialog from '@material-ui/core/Dialog';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import { cloneDeep } from 'lodash';
import EditIcon from 'material-ui/svg-icons/action/info';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

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
  const [newDashboardSpec, setNewDashboardSpec] = useState(cloneDeep(dashboardSpec));

  console.log('dashboardSpec', dashboardSpec);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitleWrapper titleText={dialogTitle} />
      <div>
        {dashboardSpec &&
          dashboardSpec.items.map(item => (
            <EditRow>
              <EditRowTitle>{item.name}</EditRowTitle>
              <EditRowActions>
                <CloseIcon />
                <EditIcon />
              </EditRowActions>
            </EditRow>
          ))}
      </div>
      <BottomBar>
        <MuiButton onClick={() => onSave(newDashboardSpec)}>Save</MuiButton>
        <MuiButton onClick={onClose}>Cancel</MuiButton>
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
