/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FakeHeader, TextField } from '@tupaia/ui-components';
import { BorderlessTable } from './TableTypes';
import { useFormFields } from '../../hooks';

// ====================================================================================
// SITE DATA
// ====================================================================================
const siteData = [
  {
    code: 'afr',
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: '15',
    totalCases: '15',
  },
  {
    code: 'dia',
    title: 'Diarrhoea (DIA)',
    percentageChange: '7',
    totalCases: '20',
  },
  {
    code: 'ili',
    title: 'Influenza-like Illness (ILI)',
    percentageChange: '10',
    totalCases: '115',
  },
  {
    code: 'pf',
    title: 'Prolonged Fever (AFR)',
    percentageChange: '-12',
    totalCases: '5',
  },
  {
    code: 'dil',
    title: 'Dengue-like Illness (DIL)',
    percentageChange: '9',
    totalCases: '54',
  },
];

// ====================================================================================
// CELL COMPONENT
// ====================================================================================
const EditableTextField = styled(TextField)`
  margin: 0;
  position: relative;
  right: 1px;
  width: 4rem;

  .MuiInputBase-input {
    text-align: center;
    font-size: 15px;
    line-height: 18px;
    padding: 0.5rem;
  }
`;

const ReadOnlyTextField = styled(EditableTextField)`
  .MuiInputBase-root {
    background: none;
  }

  .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border: none;
    box-shadow: none;
  }
`;

const TotalCasesCell = props => {
  const [fields, handleFieldChange] = useContext(EditableTableContext);
  const key = `${props.code}-totalCases`;
  return (
    <ReadOnlyTextField
      name="cases"
      value={fields[key]}
      onChange={handleFieldChange}
      id={key}
      InputProps={{ readOnly: true }}
    />
  );
};

TotalCasesCell.propTypes = {
  code: PropTypes.string.isRequired,
};

const EditableTotalCasesCell = props => {
  const [fields, handleFieldChange] = useContext(EditableTableContext);
  const key = `${props.code}-totalCases`;
  return (
    <EditableTextField name="cases" value={fields[key]} onChange={handleFieldChange} id={key} />
  );
};

EditableTotalCasesCell.propTypes = {
  code: PropTypes.string.isRequired,
};

// ====================================================================================
// COLUMNS
// ====================================================================================
const makeTableColumns = tableState => {
  return [
    {
      title: 'Title',
      key: 'title',
      width: '300px',
    },
    {
      title: 'Percentage Increase',
      key: 'percentageChange',
    },
    {
      title: 'Total Cases',
      key: 'totalCases',
      editable: true,
      CellComponent: tableState === 'editable' ? EditableTotalCasesCell : TotalCasesCell,
    },
  ];
};

// ====================================================================================
// EDITABLE TABLE
// ====================================================================================
const makeInitialFormState = columns => {
  return columns.reduce((state, column) => {
    if (column.editable) {
      const newState = state;

      siteData.forEach(row => {
        const key = `${row.code}-${column.key}`;
        newState[key] = row[column.key];
      });

      return newState;
    }

    return state;
  }, {});
};

const EditableTableContext = createContext({});

/**
 *
 * Todo: update to take columns and data props
 * Todo : make work for different table styles
 * Todo: create an array variable for table states
 */
export const EditableTable = ({ tableState, Action }) => {
  const columns = makeTableColumns(tableState);
  const initialFormState = makeInitialFormState(columns);
  const [fields, handleFieldChange] = useFormFields(initialFormState);

  console.log(initialFormState);

  return (
    <React.Fragment>
      <FakeHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </FakeHeader>
      <EditableTableContext.Provider value={[fields, handleFieldChange]}>
        <BorderlessTable columns={columns} data={siteData} />
      </EditableTableContext.Provider>
      {tableState === 'editable' && <Action fields={fields} />}
    </React.Fragment>
  );
};

EditableTable.propTypes = {
  tableState: PropTypes.string.isRequired,
  Action: PropTypes.any.isRequired,
};
