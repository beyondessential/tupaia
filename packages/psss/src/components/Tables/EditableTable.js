/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextButton, FakeHeader, TextField } from '@tupaia/ui-components';
import { BorderlessTable } from './TableTypes';
import { useFormFields } from '../../hooks';

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

const columns = [
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
  },
];

const StyledTextField = styled(TextField)`
  margin: 0;

  .MuiInputBase-input {
    text-align: center;
    font-size: 15px;
    line-height: 18px;
    padding: 0.5rem;
  }
`;

// Todo: update to take columns and data props
export const EditableTable = ({ tableState, Action }) => {
  const editableColumns = [
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
      CellComponent: EditableTotalCasesCell,
    },
  ];

  const initialFormState = editableColumns.reduce((state, column) => {
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

  // todo create enum for table state
  const [fields, handleFieldChange] = useFormFields(initialFormState);

  function EditableTotalCasesCell(props) {
    // maybe use this for the read only with invisible cell style??
    const key = `${props.code}-totalCases`;
    return (
      <StyledTextField name="cases" value={fields[key]} onChange={handleFieldChange} id={key} />
    );
  }

  EditableTotalCasesCell.propTypes = {
    code: PropTypes.string.isRequired,
  };

  const tableConfig = tableState === 'editable' ? editableColumns : columns;

  return (
    <React.Fragment>
      <FakeHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </FakeHeader>
      <BorderlessTable columns={tableConfig} data={siteData} />
      {tableState === 'editable' && Action}
    </React.Fragment>
  );
};
