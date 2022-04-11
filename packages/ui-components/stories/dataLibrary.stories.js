/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import styled from 'styled-components';
import {
  DataLibrary,
  BaseSelectedOption,
  EditableSelectedOption,
} from '../src/components/DataLibrary';
import { JsonEditor } from '../src/components/JsonEditor';

export default {
  title: 'Inputs/DataLibrary',
};

const OuterContainer = styled.div`
  max-width: 600px;
  padding: 2rem;
  background: #fff1db;
`;

const Container = styled.div`
  background: white;
`;

const DownArrowIconWrapper = styled.div`
  display: flex;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  }
`;

const Panel = styled.div`
  width: 100%;
`;

const JsonEditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > div {
    width: 100%;
    height: 100px;
  }

  .jsoneditor {
    border: none;
    cursor: text;
  }
`;

const OptionPanelWithJsonEditor = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: auto;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const options = [
  {
    id: '1',
    code: 'ABC_1ABC_1ABC_1ABC_1ABC_1ABC_1ABC_1ABC_1',
    description:
      'Count the number of data in child entities within selected period, then sum and group by ancestor entities (aggregationEntityType)',
    config: {
      type: 'COUNT_PER_GROUP',
      config: { dataSourceEntityType: 'school', aggregationEntityType: 'district' },
    },
  },
  { id: '2', code: 'ABC_2', description: 'Sentinel Site Two' },
  { id: '3', code: 'ABC_3', description: 'Sentinel Site Three' },
  { id: '4', code: 'ABC_4', description: 'Sentinel Site Four' },
  { id: '5', code: 'ABC_5', description: 'Sentinel Site Five' },
  { id: '6', code: 'ABC_6', description: 'Sentinel Site Six' },
  { id: '7', code: 'ABC_7', description: 'Sentinel Site Seven' },
  { id: '8', code: 'ABC_8', description: 'Sentinel Site Eight' },
  { id: '9', code: 'ABC_9', description: 'Sentinel Site Nine' },
  {
    id: '10',
    code: 'ABC_10_LONG_CODE_HOW_NOW_BROWN_COW_HEY_HEY',
    description: 'Sentinel Site Ten',
  },
  {
    id: '11',
    code: 'ABC_11',
    description:
      'Sentinel Site Eleven long name how now brown cow and the quick brown fox as well jumped over the lazy dog',
  },
  {
    id: '12',
    code: 'ABC_12',
    description:
      'Sentinel Site Twelve long name how now brown cow and the quick brown fox as well jumped over the lazy dog',
  },
];

export const Simple = () => {
  const [value, setValue] = useState([options[1]]);
  const [inputValue, setInputValue] = useState('');

  const onRemove = (event, option) => {
    setValue(value.filter(item => option.code !== item.code));
  };

  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={options}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          optionComponent={option => <BaseSelectedOption option={option} onRemove={onRemove} />}
        />
      </Container>
    </OuterContainer>
  );
};

export const AllowAddMultipleTimes = () => {
  const [value, setValue] = useState([options[1]]);

  const onRemove = (event, option) => {
    setValue(value.filter(item => option.code !== item.code));
  };

  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={options}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          optionComponent={option => <BaseSelectedOption option={option} onRemove={onRemove} />}
          allowAddMultipleTimes
        />
      </Container>
    </OuterContainer>
  );
};

export const Tabs = () => {
  const [value, setValue] = useState([options[1]]);
  const [dataType, setDataType] = useState('Cats');

  const dogs = [
    { id: '1', code: 'DOG_1', name: 'Dog One' },
    { id: '2', code: 'DOG_2', name: 'Dog Two' },
    { id: '3', code: 'DOG_3', name: 'Dog Three' },
  ];

  const onRemove = (event, option) => {
    setValue(value.filter(item => option.code !== item.code));
  };

  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={{ Cats: options, Dogs: dogs }}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          optionComponent={option => <BaseSelectedOption option={option} onRemove={onRemove} />}
          dataTypes={['Cats', 'Dogs']}
          dataType={dataType}
          onChangeDataType={(event, newValue) => setDataType(newValue)}
        />
      </Container>
    </OuterContainer>
  );
};

export const Loading = () => {
  return (
    <OuterContainer>
      <Container>
        <DataLibrary options={options} isLoading />
      </Container>
    </OuterContainer>
  );
};

export const MaxNumResults = () => {
  return (
    <OuterContainer>
      <Container>
        <DataLibrary options={options} searchPageSize={12} />
      </Container>
    </OuterContainer>
  );
};

const SelectedOptionWithJsonEditor = ({ option, onRemove, setIsDragDisabled }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <OptionPanelWithJsonEditor>
      <DownArrowIconWrapper $expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
        <DownArrow />
      </DownArrowIconWrapper>
      <Panel>
        <BaseSelectedOption option={option} onRemove={onRemove} />
        {isExpanded && (
          <JsonEditorPanel
            onMouseOver={() => setIsDragDisabled(true)}
            onMouseLeave={() => setIsDragDisabled(false)}
          >
            <JsonEditor value={option} mode="code" mainMenuBar={false} statusBar={false} />
          </JsonEditorPanel>
        )}
      </Panel>
    </OptionPanelWithJsonEditor>
  );
};

export const WithJsonEditor = () => {
  const [value, setValue] = useState([options[1]]);
  const [inputValue, setInputValue] = useState('');
  const [isDisabledAll, setIsDisabledAll] = useState(false);

  const onRemove = (event, option) => {
    setValue(value.filter(item => option.code !== item.code));
  };

  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={options}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          optionComponent={(option, setIsDragDisabled) => (
            <SelectedOptionWithJsonEditor
              option={option}
              onRemove={onRemove}
              setIsDragDisabled={setIsDragDisabled}
            />
          )}
          headerConfig={{ isDisabledAll, setIsDisabledAll }}
        />
      </Container>
    </OuterContainer>
  );
};

export const EditableTitle = () => {
  const [value, setValue] = useState([options[1]]);
  const [inputValue, setInputValue] = useState('');

  const onRemove = (event, option) => {
    setValue(value.filter(item => option.code !== item.code));
  };

  const onTitleChange = option => {
    const optionIndex = value.findIndex(item => option.id === item.id);
    const newValue = [...value];
    newValue[optionIndex] = option;
    setValue(newValue);
  };

  return (
    <OuterContainer>
      <Container>
        <DataLibrary
          options={options}
          value={value}
          onChange={(event, newValue) => setValue(newValue)}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          optionComponent={option => (
            <EditableSelectedOption
              option={option}
              onRemove={onRemove}
              onTitleChange={onTitleChange}
            />
          )}
        />
      </Container>
    </OuterContainer>
  );
};
