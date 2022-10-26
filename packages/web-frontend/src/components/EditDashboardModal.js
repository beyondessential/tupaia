// import Dialog from '@material-ui/core/Dialog';
import { Dialog } from '@tupaia/ui-components';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import { cloneDeep } from 'lodash';
import EditIcon from 'material-ui/svg-icons/action/info';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import CloseButton from '@material-ui/icons/Close';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
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
  width: 30px;
  display: flex;
  align-items: center;
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
      textAlign: 'left',
      paddingBottom: 5,
      borderBottom: '1px solid white',
      paddingLeft: 0,
      marginBottom: 20,
      paddingBottom: 10,
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
      padding: '50px 45px 15px 60px',
      minHeight: 400,
    },
    autocomplete: {
      paddingRight: 0,
    },
    save: {
      marginLeft: 10,
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
                            <EditRow>
                              <DragHandle {...draggableProvided.dragHandleProps}>
                                <DragIndicatorIcon color="action" />
                              </DragHandle>
                              <EditRowTitle>{item.name}</EditRowTitle>
                              <EditRowActions>
                                <IconButton onClick={() => rmDashboardItem(item.code)}>
                                  <DeleteOutlineIcon color="primary" fontSize="medium" />
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
