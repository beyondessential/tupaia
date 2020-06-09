/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { TextField } from '../Inputs';
import { Table } from './Table';
import * as COLORS from '../../../stories/story-utils/theme/colors';

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
    padding: 0.5rem 0;
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

  if (!value) {
    return null;
  }

  if (tableStatus === TABLE_STATUSES.EDITABLE) {
    return (
      <EditableTextField name={columnKey} value={value} onChange={handleFieldChange} id={key} />
    );
  }

  return (
    <ReadOnlyTextField
      name="cases"
      value={value}
      onChange={handleFieldChange}
      InputProps={{ readOnly: true }}
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
  const initialState = makeInitialFormState(columns, data);
  const editableColumns = makeEditableColumns(columns);
  const [fields, handleFieldChange, setValues] = useFormFields(initialState);

  useEffect(() => {
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

const LoadingContainer = styled.div`
  position: relative;
`;

const loadingBackgroundColor = '#f9f9f9';

const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${loadingBackgroundColor};
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  z-index: 10;
`;

const Loader = styled(CircularProgress)`
  margin-bottom: 1rem;
`;

const LoadingHeading = styled(Typography)`
  margin-bottom: 0.5rem;
`;

const LoadingText = styled(Typography)`
  margin-bottom: 0.5rem;
  color: ${COLORS.TEXT_MIDGREY};
`;

/**
 * Adds a loader around the table
 */
export const EditableTableLoader = ({ isLoading, heading, text, children }) => {
  if (isLoading) {
    return (
      <LoadingContainer>
        {children}
        <LoadingScreen>
          <Loader />
          <LoadingHeading variant="h5">{heading}</LoadingHeading>
          <LoadingText variant="body2">{text}</LoadingText>
        </LoadingScreen>
      </LoadingContainer>
    );
  }

  return children;
};

EditableTableLoader.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  children: PropTypes.any.isRequired,
  heading: PropTypes.string,
  text: PropTypes.string,
};

EditableTableLoader.defaultProps = {
  heading: 'Saving Data',
  text: 'Please do not refresh browser or close this page',
};
