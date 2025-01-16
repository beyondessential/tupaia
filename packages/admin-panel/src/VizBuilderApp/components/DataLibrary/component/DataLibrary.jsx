import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { Drawer as MuiDrawer, IconButton as MuiIconButton } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import { CreateNewFolder } from '@material-ui/icons';
import { useAutocomplete } from '@material-ui/lab';
import { DragDropContext } from 'react-beautiful-dnd';
import { FlexColumn } from '@tupaia/ui-components';
import { InputField } from './InputField';
import { ResultsList } from './ResultsList';
import { SelectedDataHeader } from './SelectedDataHeader';
import { SelectedDataList } from './SelectedDataList';
import { DataTypeTabs } from './DataTypeTabs';
import { ColHeader } from './styles';
import { ALICE_BLUE } from './constant';

/*
 * A DataLibrary is similar to an Autocomplete but shows the options below for easier browsing,
 * and selection of these options displays them in a column on the right.
 */
const DRAWER_WIDTH = '240px';

const IconButton = styled(MuiIconButton)`
  margin-left: 2px;
  display: ${props => (props.open ? 'none' : 'default')};
`;

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  padding: 0;
  height: 600px;
`;

const RightCol = styled(FlexColumn)`
  flex-grow: 1;
  padding: 0;
  margin-left: ${props => (props.open ? 0 : `-${DRAWER_WIDTH}`)};
`;

const LeftColHeader = styled(ColHeader)`
  padding: 0;
  justify-content: space-between;
  background: #f9f9f9;
`;

const RightColHeader = styled(ColHeader)`
  justify-content: flex-start;
  padding: 0;
  background: ${ALICE_BLUE};
`;

const CreateNewFolderIcon = styled(CreateNewFolder)`
  height: 18px;
  margin-right: 2px;
  color: #418bbd;
`;

const ColContents = styled.div`
  flex-direction: column;
  flex: 1;
`;

const RightColContents = styled(ColContents)`
  background-color: #f6fbff;
  box-shadow: -1px 0px 0px #dedee0;
`;

const Drawer = styled(MuiDrawer)`
  margin-right: auto;
  position: relative;
  width: ${DRAWER_WIDTH};
  flex-shrink: 0;

  .MuiDrawer-paper {
    position: absolute;
    width: ${DRAWER_WIDTH};
    transition: none !important;
  }
`;

export const DataLibrary = ({
  options,
  value,
  onChange,
  allowAddMultipleTimes,
  dataTypes,
  dataType,
  onChangeDataType,
  inputValue,
  onInputChange,
  isLoading,
  searchPageSize,
  optionComponent,
  supportsDisableAll,
}) => {
  const [open, setOpen] = useState(true);

  if (dataTypes.length > 1 && Array.isArray(options)) {
    throw new Error('Must specify options as a map when using multiple data types');
  }

  const { groupedOptions, getRootProps, getInputProps, getOptionProps } = useAutocomplete({
    options: dataTypes.length > 1 ? options[dataType] : options,
    open: true,
    multiple: true,
    freeSolo: true,
    value,
    getOptionLabel: option => `${option.code} ${option.description}`, // filter on both code and description
    onChange,
    inputValue,
    onInputChange,
  });

  const onDragEnd = event => {
    const { destination, source } = event;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newValue = Array.from(value);
    const currentIndex = source.index;
    newValue.splice(currentIndex, 1);
    newValue.splice(destination.index, 0, value[currentIndex]);

    onChange(event, newValue);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Container>
      <Drawer variant="persistent" anchor="left" open={open}>
        <LeftColHeader>
          <ColHeader>
            <CreateNewFolderIcon />
            Data Library
          </ColHeader>
          <MuiIconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </MuiIconButton>
        </LeftColHeader>
        <ColContents>
          <DataTypeTabs dataTypes={dataTypes} dataType={dataType} onChange={onChangeDataType} />
          <>
            <InputField
              getRootProps={getRootProps}
              getInputProps={getInputProps}
              isLoading={isLoading}
            />
            <ResultsList
              groupedOptions={groupedOptions}
              getOptionProps={getOptionProps}
              allowAddMultipleTimes={allowAddMultipleTimes}
              value={value}
              onChange={onChange}
              searchPageSize={searchPageSize}
            />
          </>
        </ColContents>
      </Drawer>

      <RightCol open={open}>
        <RightColHeader>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            open={open}
          >
            <MenuIcon />
          </IconButton>
          <SelectedDataHeader
            onChange={onChange}
            selectedData={value}
            supportsDisableAll={supportsDisableAll}
            open={open}
            setOpen={setOpen}
          />
        </RightColHeader>
        <RightColContents>
          <DragDropContext onDragEnd={onDragEnd}>
            <SelectedDataList value={value} optionComponent={optionComponent} />
          </DragDropContext>
        </RightColContents>
      </RightCol>
    </Container>
  );
};

const optionPropType = PropTypes.shape({
  id: PropTypes.string,
  code: PropTypes.string,
  description: PropTypes.string,
});

DataLibrary.defaultProps = {
  onChange: () => {},
  allowAddMultipleTimes: false,
  dataTypes: [],
  dataType: '',
  onChangeDataType: () => {},
  value: [],
  inputValue: '',
  onInputChange: () => {},
  isLoading: false,
  searchPageSize: null,
  supportsDisableAll: false,
};

DataLibrary.propTypes = {
  // options: either an array of options if single data type or map of dataType -> options
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(optionPropType)]).isRequired,
  value: PropTypes.arrayOf(optionPropType),
  onChange: PropTypes.func,
  allowAddMultipleTimes: PropTypes.bool,
  dataTypes: PropTypes.arrayOf(PropTypes.string),
  dataType: PropTypes.string,
  onChangeDataType: PropTypes.func,
  inputValue: PropTypes.string,
  onInputChange: PropTypes.func,
  isLoading: PropTypes.bool,
  // searchPageSize: used in combination with options (current page) to know if there are more pages
  searchPageSize: PropTypes.number,
  optionComponent: PropTypes.func.isRequired,
  supportsDisableAll: PropTypes.bool,
};
