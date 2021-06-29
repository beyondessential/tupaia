/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiSnackbar from '@material-ui/core/Snackbar';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Select, SmallAlert } from '@tupaia/ui-components';
import { useUpdateUserEntityPermission } from '../../api/mutations/useUpdateUserEntityPermission';
import { LESMIS_PERMISSION_GROUPS } from '../../constants';

const StyledSelect = styled(Select)`
  margin: 0;

  .MuiInputBase-root {
    background: none;
  }

  .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  .MuiSelect-root {
    background: none;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1rem;
    padding-left: 0;
  }
`;

export const UserPermissionsCell = ({ value, row }) => {
  const [activeValue, setActiveValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isLoading, isError, isSuccess } = useUpdateUserEntityPermission();
  const { userEntityPermissionId } = row.original;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChange = async event => {
    const newValue = event.target.value;
    setActiveValue(newValue);
    mutate(
      {
        userEntityPermissionId,
        permissionGroupName: newValue,
      },
      {
        onSuccess: () => {
          setIsOpen(true);
        },
        onError: () => {
          setIsOpen(true);
          setActiveValue(value);
        },
      },
    );
  };

  return (
    <>
      <StyledSelect
        id="permissions"
        disabled={isLoading}
        options={[
          { label: 'Public', value: LESMIS_PERMISSION_GROUPS.PUBLIC },
          { label: 'Senior User', value: LESMIS_PERMISSION_GROUPS.USER },
          { label: 'Admin', value: LESMIS_PERMISSION_GROUPS.ADMIN },
        ]}
        onChange={handleChange}
        value={activeValue}
        showPlaceholder={false}
        SelectProps={{
          IconComponent: iconProps => <ArrowDropDownIcon {...iconProps} />,
        }}
      />
      <MuiSnackbar
        open={isOpen}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <>
          {isSuccess && (
            <SmallAlert onClose={handleClose} severity="success">
              Success
            </SmallAlert>
          )}
          {isError && (
            <SmallAlert onClose={handleClose} severity="error">
              Error. Please click refresh and try again.
            </SmallAlert>
          )}
        </>
      </MuiSnackbar>
    </>
  );
};

UserPermissionsCell.propTypes = {
  value: PropTypes.string,
  row: PropTypes.shape({
    original: PropTypes.object,
  }).isRequired,
};

UserPermissionsCell.defaultProps = {
  value: null,
};
