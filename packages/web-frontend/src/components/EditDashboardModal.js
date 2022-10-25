import Dialog from '@material-ui/core/Dialog';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import { cloneDeep } from 'lodash';
import EditIcon from 'material-ui/svg-icons/action/info';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import IconButton from 'material-ui/IconButton';
import { Autocomplete } from './Autocomplete';
import { DIALOG_Z_INDEX } from '../styles';

const DashboardItems = styled.div`
  min-height: 400px;
`;

const DragHandle = styled.div`
  width: 20px;
`;

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

const BottomBar = styled.div``;

const EditRow = styled.div`
  padding: 20px;
  display: flex;
`;

const EditRowTitle = styled.div`
  border: 1px solid white;
  padding: 5px;
  flex: 1;
`;
const EditRowActions = styled.div`
  flex: 0;
  display: block;
`;

const dialogTitle = 'Edit Dashboard';

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: '0',
  margin: `0 0 20px 0`,
  outline: '1px solid red',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'none',
  padding: 12,
  width: 450,
});

export const EditDashboardModal = ({
  dashboardSpec,
  isOpen,
  onClose,
  onSave,
  dashboardItemEditOptions,
}) => {
  const clonedDashboardSpec = cloneDeep(dashboardSpec);
  const [newDashboardSpec, setNewDashboardSpec] = useState(clonedDashboardSpec);
  const [isNewDashboardSelected, setIsNewDashboardSelected] = useState(false);
  const [selectedNewDashboardOption, setSelectedNewDashboardOption] = useState({});
  console.log('newDashboardSpec', newDashboardSpec);

  const closeMeself = () => {
    // reset state
    setNewDashboardSpec(clonedDashboardSpec);
    setSelectedNewDashboardOption({});
    setIsNewDashboardSelected(false);
    // close modal
    onClose();
  };

  const rmDashboardItem = itemToRmCode => {
    const newItems = newDashboardSpec.items.filter(i => i.code !== itemToRmCode);
    setNewDashboardSpec({
      ...newDashboardSpec,
      items: newItems,
    });
  };

  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const items = reorder(newDashboardSpec.items, result.source.index, result.destination.index);

    setNewDashboardSpec({
      ...newDashboardSpec,
      items,
    });
  };

  const styles = {
    toolbar: {
      position: 'absolute',
      top: 5,
      right: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(255,255,255,0.2)',
      zIndex: DIALOG_Z_INDEX,
    },
    toolbarButton: {
      verticalAlign: 'top',
      width: 28,
      height: 28,
      borderWidth: 0,
      padding: 5,
    },
    toolbarButtonIcon: {
      width: 18,
      height: 18,
    },
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md">
      <div style={{ ...styles.toolbar }}>
        <MuiButton onClick={() => onSave(newDashboardSpec)}>Save</MuiButton>
        <IconButton
          style={styles.toolbarButton}
          iconStyle={styles.toolbarButtonIcon}
          onClick={() => closeMeself()}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <DialogTitleWrapper titleText={dialogTitle} />
      <h6>Add Dashboard Item</h6>
      <Autocomplete
        options={dashboardItemEditOptions}
        optionLabelKey="name"
        placeholder="Search for a dashboard item"
        setIsNewDashboardSelected={setIsNewDashboardSelected}
        setSelectedNewDashboardOption={setSelectedNewDashboardOption}
        setNewDashboardSpec={setNewDashboardSpec}
        newDashboardSpec={newDashboardSpec}
      />
      <h6>Dashboard Items</h6>
      <DashboardItems>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-edit-list-dnd">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {newDashboardSpec &&
                  newDashboardSpec.items.map((item, index) => (
                    <Draggable draggableId={item.code} index={index} key={`draggable-${index}`}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <EditRow>
                            <DragHandle {...provided.dragHandleProps}>
                              <DragIndicatorIcon color="action" />
                            </DragHandle>
                            <EditRowTitle>
                              [{index}] {item.name}
                            </EditRowTitle>
                            <EditRowActions>
                              <IconButton
                                style={styles.toolbarButton}
                                iconStyle={styles.toolbarButtonIcon}
                                onClick={() => rmDashboardItem(item.code)}
                              >
                                <DeleteOutlineIcon
                                  color="primary"
                                  fontSize="large"
                                  variant="outline"
                                />
                              </IconButton>
                            </EditRowActions>
                          </EditRow>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </DashboardItems>
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
  dashboardItemEditOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
