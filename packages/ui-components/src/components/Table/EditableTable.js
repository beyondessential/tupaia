/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '../Inputs';

const EditableTextField = styled(TextField)`
  margin: 0;
  position: relative;
  right: 1px;
  //width: 4rem;

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

const EditableTableContext = createContext({});

export const EditableCell = ({ id, columnKey }) => {
  const { fields, handleFieldChange, tableState } = useContext(EditableTableContext);
  const key = `${id}-${columnKey}`;
  if (tableState === 'editable') {
    return (
      <EditableTextField
        name={columnKey}
        value={fields[key]}
        onChange={handleFieldChange}
        id={key}
      />
    );
  }

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

EditableCell.propTypes = {
  id: PropTypes.string.isRequired,
  columnKey: PropTypes.string.isRequired,
};

const makeInitialFormState = (columns, data) => {
  return columns.reduce((state, column) => {
    if (column.editable) {
      const newState = state;
      data.forEach(row => {
        const key = `${row.id}-${column.key}`;
        newState[key] = row[column.key];
      });

      return newState;
    }

    return state;
  }, {});
};

const makeEditableColumns = columns => {
  return columns.map(column => {
    if (column.editable) {
      return { ...column, CellComponent: EditableCell };
    }

    return column;
  });
};

const useFormFields = initialState => {
  const [fields, setValues] = useState(initialState);
  return [
    fields,
    event => {
      setValues({
        ...fields,
        [event.target.id]: event.target.value,
      });
    },
    setValues,
  ];
};

export const EditableTableProvider = ({ columns, data, tableState, children }) => {
  const initialState = makeInitialFormState(columns, data);
  const editableColumns = makeEditableColumns(columns);
  const [fields, handleFieldChange, setValues] = useFormFields(initialState);

  useEffect(() => {
    if (tableState !== 'editing') {
      setValues(initialState);
    }
  }, [data]);

  return (
    <React.Fragment>
      <EditableTableContext.Provider
        value={{ fields, handleFieldChange, tableState, editableColumns, data }}
      >
        {children}
      </EditableTableContext.Provider>
    </React.Fragment>
  );
};

EditableTableProvider.propTypes = {
  tableState: PropTypes.PropTypes.oneOf(['static', 'editable', 'loading']).isRequired,
  children: PropTypes.any.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.node.isRequired,
      accessor: PropTypes.func,
      editable: PropTypes.bool,
      CellComponent: PropTypes.any,
      sortable: PropTypes.bool,
    }),
  ).isRequired,
  data: PropTypes.array.isRequired,
};

export const EditableTable = ({ Component }) => {
  const { editableColumns, data, tableState } = useContext(EditableTableContext);
  return <Component columns={editableColumns} data={data} tableState={tableState} />;
};

EditableTable.propTypes = {
  Component: PropTypes.any.isRequired,
};

export const EditableTableAction = ({ Component }) => {
  const { fields } = useContext(EditableTableContext);
  return <Component fields={fields} />;
};

EditableTableAction.propTypes = {
  Component: PropTypes.any.isRequired,
};
