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
  right: 1px;

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

const STATIC = 'static';
const EDITABLE = 'editable';
const LOADING = 'loading';
const SAVING = 'saving';

const EditableCell = React.memo(({ id, columnKey }) => {
  const { fields, handleFieldChange, tableState } = useContext(EditableTableContext);
  const key = `${id}-${columnKey}`;
  const value = fields[key];

  if (!value) {
    return null;
  }

  if (tableState === EDITABLE) {
    return (
      <EditableTextField name={columnKey} value={value} onChange={handleFieldChange} id={key} />
    );
  }

  return (
    <ReadOnlyTextField
      name="cases"
      value={value}
      onChange={handleFieldChange}
      id={key}
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

// Todo: prevState
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

export const EditableTableProvider = React.memo(
  ({ columns, data, tableState, initialMetadata, children }) => {
    const initialState = makeInitialFormState(columns, data);
    const editableColumns = makeEditableColumns(columns);
    const [fields, handleFieldChange, setValues] = useFormFields(initialState);
    const [metadata, setMetadata] = useState(initialMetadata);

    useEffect(() => {
      // loading must change after initial state is set
      if (tableState === LOADING) {
        setValues(initialState);
        setMetadata(initialMetadata);
      }
    }, [data]);

    return (
      <EditableTableContext.Provider
        value={{
          fields,
          handleFieldChange,
          tableState,
          editableColumns,
          data,
          metadata,
          setMetadata,
        }}
      >
        {children}
      </EditableTableContext.Provider>
    );
  },
);

EditableTableProvider.propTypes = {
  tableState: PropTypes.PropTypes.oneOf([STATIC, EDITABLE, SAVING, LOADING]).isRequired,
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
  initialMetadata: PropTypes.object,
};

EditableTableProvider.defaultProps = {
  initialMetadata: {},
};

export const EditableTable = props => {
  const { editableColumns, data } = useContext(EditableTableContext);
  return <Table columns={editableColumns} data={data} {...props} />;
};

const LoadingContainer = styled.div`
  position: relative;
`;

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
  background: #f9f9f9;
  border: 1px solid #dedee0;
  border-radius: 3px;
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
