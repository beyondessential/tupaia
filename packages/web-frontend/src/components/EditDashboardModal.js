// import Dialog from '@material-ui/core/Dialog';
import { Dialog } from '@tupaia/ui-components';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import { cloneDeep } from 'lodash';
import EditIcon from '@material-ui/icons/Edit';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import CloseButton from '@material-ui/icons/Close';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import MuiTextField from '@material-ui/core/TextField';
import { Autocomplete } from './Autocomplete';
import { DIALOG_Z_INDEX } from '../styles';

const Heading = styled(Typography)`
  font-size: 20px;
  font-weight: 700;
`;

const SubHeading = styled(Typography)`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  padding-top: 10px;
`;

const DashboardItems = styled.div`
  margin-bottom: 15px;
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
`;

const AddButton = styled(Link)`
  padding-top: 15px;
`;

const EditButton = ({ dashboardItemCode }) => (
  // Big ol' hack for the hackathon!
  <IconButton
    href={`https://hackathon-viz-workflow-admin.tupaia.org/dashboard-items?filters=[{"id":"code","value":"${dashboardItemCode}"}]`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <EditIcon fontSize="md" />
  </IconButton>
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
      textAlign: 'left',
      paddingBottom: 10,
      borderBottom: '1px solid white',
      paddingLeft: 0,
      marginBottom: 20,
    },
  };

  return (
    <DialogTitle style={styles.dialogTitle}>
      <Heading>{titleText}</Heading>
    </DialogTitle>
  );
};

const Toolbar = styled.div`
  padding-top: 10px;
  text-align: right;
`;

const EditRow = styled.div`
  display: flex;
`;

const EditRowTitle = styled.div`
  border: 1px solid white;
  padding: 10px;
  flex: 1;
`;
const EditRowActions = styled.div`
  flex: 0;
  display: flex;
  align-items: center;
`;

const dialogTitle = 'Edit Dashboard';

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: '0',
  margin: `0 0 10px 0`,

  // change background colour if dragging
  background: isDragging ? 'rgba(0, 0, 0, 0.5)' : 'none',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  // background: isDraggingOver ? 'lightblue' : 'none',
  padding: 5,
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

  const addItem = () => {
    if (!isNewDashboardSelected) {
      return;
    }
    const newItems = [selectedNewDashboardOption].concat(newDashboardSpec.items);
    setNewDashboardSpec({
      ...newDashboardSpec,
      items: newItems,
    });
  };

  const handleChangeItemName = (newValue, itemIndex) => {
    const specWithUpdatedName = { ...newDashboardSpec };
    specWithUpdatedName.items[itemIndex].name = newValue;
    setNewDashboardSpec({
      ...specWithUpdatedName,
    });
  };

  const styles = {
    toolbar: {
      position: 'absolute',
      top: 5,
      right: 10,
      borderRadius: 5,
      zIndex: DIALOG_Z_INDEX,
    },
    toolbarButton: {
      verticalAlign: 'top',
      width: 28,
      height: 28,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.2)',
      padding: 5,
    },
    toolbarButtonIcon: {
      width: 18,
      height: 18,
    },
    box: {
      padding: '50px 45px 40px 60px',
      minHeight: 400,
    },
    save: {
      marginLeft: 10,
    },
    textField: {
      width: '100%',
    },
  };

  // TODO: need to get rid of mysterious margin on right of Box component

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md">
      <Box style={{ ...styles.box }}>
        <div style={{ ...styles.toolbar }}>
          <Toolbar>
            <IconButton onClick={() => closeMeself()}>
              <CloseButton />
            </IconButton>
          </Toolbar>
        </div>
        <DialogTitleWrapper titleText={dialogTitle} />
        <SubHeading>Add Dashboard Item</SubHeading>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <Autocomplete
              options={dashboardItemEditOptions}
              optionLabelKey="name"
              placeholder="Search"
              setIsNewDashboardSelected={setIsNewDashboardSelected}
              setSelectedNewDashboardOption={setSelectedNewDashboardOption}
              setNewDashboardSpec={setNewDashboardSpec}
              newDashboardSpec={newDashboardSpec}
              style={{ ...styles.autocomplete }}
            />
          </Grid>
          <Grid item xs={1}>
            <AddButton component="button" variant="h6" onClick={() => addItem()}>
              + Add
            </AddButton>
          </Grid>
        </Grid>
        <SubHeading>Dashboard Items</SubHeading>
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
                      <Draggable
                        draggableId={item.code}
                        index={index}
                        key={`draggable-${item.code}`}
                      >
                        {(draggableProvided, draggableSnapshot) => (
                          <div
                            {...draggableProvided.draggableProps}
                            ref={draggableProvided.innerRef}
                            style={getItemStyle(
                              draggableSnapshot.isDragging,
                              draggableProvided.draggableProps.style,
                            )}
                          >
                            <Grid container spacing={2}>
                              <Grid item xs={1}>
                                <DragHandle {...draggableProvided.dragHandleProps}>
                                  <DragIndicatorIcon color="action" />
                                </DragHandle>
                              </Grid>
                              <Grid item xs={9}>
                                <MuiTextField
                                  variant="outlined"
                                  value={item.name}
                                  style={{ ...styles.textField }}
                                  onChange={event =>
                                    handleChangeItemName(event.target.value, index)
                                  }
                                />
                              </Grid>
                              <Grid item xs={2}>
                                <EditRowActions>
                                  <IconButton onClick={() => rmDashboardItem(item.code)}>
                                    <DeleteOutlineIcon color="primary" fontSize="medium" />
                                  </IconButton>
                                  <EditButton dashboardItemCode={item.code} />
                                </EditRowActions>
                              </Grid>
                            </Grid>
                            <EditRow />
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
        <Toolbar>
          <MuiButton variant="outlined" onClick={() => closeMeself()}>
            Cancel
          </MuiButton>
          <MuiButton
            style={{ ...styles.save }}
            variant="contained"
            color="primary"
            onClick={() => onSave(newDashboardSpec)}
          >
            Save
          </MuiButton>
        </Toolbar>
      </Box>
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
