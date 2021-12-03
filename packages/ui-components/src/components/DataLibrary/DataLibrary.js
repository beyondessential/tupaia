/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { CreateNewFolder } from '@material-ui/icons';
import { FlexColumn } from '../Layout';
import { InputField } from './InputField';
import { ResultsList } from './ResultsList';
import { useAutocomplete } from '@material-ui/lab';
import { SelectedDataList } from './SelectedDataList';
import { DataTypeTabs } from './DataTypeTabs';

/*
 * A DataLibrary is similar to an Autocomplete but shows the options below for easier browsing,
 * and selection of these options displays them in a column on the right.
 */

const Container = styled(MuiContainer)`
  flex: 1;
  display: flex;
  padding: 0;
`;

const Col = styled(FlexColumn)`
  width: 50%;
`;

const ColHeader = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 12px;
  box-shadow: inset 0px -1px 0px #dedee0;
  padding: 15px;
  color: #2c3236;
`;

const LeftColHeader = styled(ColHeader)`
  background: #f9f9f9;
`;

const RightColHeader = styled(ColHeader)`
  background: #e8f6ff;
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
}) => {
  if (dataTypes.length > 1 && Array.isArray(options)) {
    throw new Error('Must specify options as a map when using multiple data types');
  }

  const { groupedOptions, getRootProps, getInputProps, getOptionProps } = useAutocomplete({
    options: dataTypes.length > 1 ? options[dataType] : options,
    open: true,
    multiple: true,
    freeSolo: true,
    value,
    getOptionLabel: option => `${option.code} ${option.name}`, // filter on both code and name
    onChange,
    inputValue,
    onInputChange,
  });

  return (
    <Container>
      <Col>
        <LeftColHeader>
          <CreateNewFolderIcon />
          Data Library
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
      </Col>
      <Col>
        <RightColHeader>Selected Data</RightColHeader>
        <RightColContents>
          <SelectedDataList
            value={value}
            onRemove={(event, option) => {
              onChange(
                event,
                value.filter(item => option !== item),
              );
            }}
          />
        </RightColContents>
      </Col>
    </Container>
  );
};

// FIXME: del id, name not needed
const optionPropType = PropTypes.shape({
  id: PropTypes.string,
  code: PropTypes.string,
  name: PropTypes.string,
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
};

DataLibrary.propTypes = {
  // options: either an array of options if single data type or map of dataType -> options
  options: PropTypes.oneOf([PropTypes.object, PropTypes.arrayOf(optionPropType)]).isRequired,
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
};
