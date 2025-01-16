import React, { createContext, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip, TextField } from '@tupaia/ui-components';
import { TABLE_STATUSES } from '../constants';

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

const ErrorTooltip = styled(Tooltip)`
  & .MuiTooltip-tooltip {
    background: ${props => props.theme.palette.error.main};

    .MuiTooltip-arrow {
      color: ${props => props.theme.palette.error.main};
    }
  }
`;

export const EditableTableContext = createContext({});

export const EditableCell = React.memo(({ id, columnKey, ...props }) => {
  const { register, errors } = useFormContext();
  const { tableStatus } = useContext(EditableTableContext);
  const defaultValue = props[columnKey] ?? '';
  const editable = tableStatus === TABLE_STATUSES.EDITABLE;

  if (editable) {
    return (
      <ErrorTooltip title={errors[id] ? errors[id].message : ''} placement="left" open>
        <EditableTextField
          id={id}
          name={id}
          defaultValue={defaultValue}
          inputProps={{ 'aria-label': columnKey }}
          error={!!errors[id]}
          inputRef={register({
            required: 'Required',
            pattern: {
              value: /^\d+$/,
              message: 'Invalid character',
            },
          })}
        />
      </ErrorTooltip>
    );
  }

  return (
    <ReadOnlyTextField
      name={id}
      value={defaultValue}
      inputProps={{ 'aria-label': columnKey, readOnly: true }}
    />
  );
});

EditableCell.propTypes = {
  id: PropTypes.string.isRequired,
  columnKey: PropTypes.string.isRequired,
};

export const EditableTableProvider = React.memo(({ tableStatus, setTableStatus, children }) => {
  return (
    <EditableTableContext.Provider
      value={{
        tableStatus,
        setTableStatus,
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
  setTableStatus: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
