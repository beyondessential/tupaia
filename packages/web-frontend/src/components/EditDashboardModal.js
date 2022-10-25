import Dialog from '@material-ui/core/Dialog';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import MuiButton from '@material-ui/core/Button';
import styled from 'styled-components';
import { cloneDeep } from 'lodash';
import EditIcon from 'material-ui/svg-icons/action/info';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Autocomplete } from './Autocomplete';

const DashboardItems = styled.div`
  min-height: 600px;
`;

const DragHandle = styled.div`
  width: 20px;
  outline: 3px solid purple;
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

export const EditDashboardModal = ({
  dashboardSpec,
  isOpen,
  onClose,
  onSave,
  dashboardItemEditOptions,
}) => {
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

  const rmDashboardItem = itemToRmCode => {
    console.log('itemToRmCode', itemToRmCode);
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

    console.log('items before', newDashboardSpec.items);

    const items = reorder(newDashboardSpec.items, result.source.index, result.destination.index);

    console.log('items after', items);

    setNewDashboardSpec({
      ...newDashboardSpec,
      items,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitleWrapper titleText={dialogTitle} />
      <h6>Add Dashboard Item</h6>
      <Autocomplete
        options={dashboardItemEditOptions}
        optionLabelKey="code"
        optionValueKey="id"
        placeholder="Search for a dashboard item"
      />
      <h6>Dashboard Items</h6>
      <DashboardItems>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-edit-list-dnd">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {newDashboardSpec &&
                  newDashboardSpec.items.map((item, index) => (
                    <Draggable draggableId={item.code} index={index} key={`draggable-${index}`}>
                      {(provided, snapshot) => (
                        <div {...provided.draggableProps} ref={provided.innerRef}>
                          <EditRow>
                            <DragHandle {...provided.dragHandleProps}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24"
                                viewBox="0 0 24 24"
                                width="24"
                              >
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path
                                  fill="white"
                                  d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                                />
                              </svg>
                            </DragHandle>
                            <EditRowTitle>
                              [{index}] {item.name}
                            </EditRowTitle>
                            <EditRowActions>
                              <CloseIcon onClick={() => rmDashboardItem(item.code)} />
                              <EditButton dashboardItemCode={item.code} />
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
