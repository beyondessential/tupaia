import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '../Inputs';
import { Table } from './Table';

const EditableTextField = styled(TextField)`
  margin: 0;
  position: relative;

  .MuiInputBase-root {
    position: absolute;
    top: -6px;
    left: 0;
    min-width: 50px;
  }

  .MuiInputBase-input {
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

export const EditableTableContext = createContext({});

const TABLE_STATUSES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  LOADING: 'loading',
  SAVING: 'saving',
};

const EditableCell = React.memo(({ id, columnKey }) => {
  const { fields, handleFieldChange, tableStatus } = useContext(EditableTableContext);
  const key = `${id}-${columnKey}`;
  const value = fields[key];

  if (value === undefined) {
    return null;
  }

  if (tableStatus === TABLE_STATUSES.EDITABLE) {
    return (
      <EditableTextField
        inputProps={{ 'aria-label': columnKey }}
        name={columnKey}
        value={value}
        onChange={handleFieldChange}
        id={key}
      />
    );
  }

  return (
    <ReadOnlyTextField
      name="cases"
      value={value}
      onChange={handleFieldChange}
      inputProps={{ 'aria-label': columnKey, readOnly: true }}
    />
  );
});

EditableCell.propTypes = {
  id: PropTypes.string.isRequired,
  columnKey: PropTypes.string.isRequired,
};

/*
 * Make the editable data into a a flat object of key value paris
 */
const makeInitialFormState = (columns, data) => {
  return columns.reduce((state, column) => {
    if (column.editable) {
      const newState = { ...state };
      data.forEach(row => {
        const key = `${row.id}-${column.key}`;
        newState[key] = row[column.key];
      });

      return newState;
    }

    return state;
  }, {});
};

/*
 * Add the EditableCell Cell Component to columns marked as editable
 */
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
      const { value, id } = event.target;
      setValues(prevFields => ({
        ...prevFields,
        [id]: value,
      }));
    },
    setValues,
  ];
};

export const EditableTableProvider = React.memo(({ columns, data, tableStatus, children }) => {
  const editableColumns = makeEditableColumns(columns);
  const [fields, handleFieldChange, setValues] = useFormFields({});

  useEffect(() => {
    const initialState = makeInitialFormState(columns, data);
    setValues(initialState);
  }, [data]);

  return (
    <EditableTableContext.Provider
      value={{
        fields,
        handleFieldChange,
        tableStatus,
        editableColumns,
        data,
      }}
    >
      {children}
    </EditableTableContext.Provider>
  );
});

EditableTableProvider.propTypes = {
  tableStatus: PropTypes.PropTypes.oneOf([
    TABLE_STATUSES.STATIC,
    TABLE_STATUSES.EDITABLE,
    TABLE_STATUSES.SAVING,
    TABLE_STATUSES.LOADING,
  ]).isRequired,
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

export const EditableTable = props => {
  const { editableColumns, data } = useContext(EditableTableContext);
  return <Table columns={editableColumns} data={data} {...props} />;
};
