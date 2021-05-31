/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Tooltip from '@material-ui/core/Tooltip';
import { Select } from '@tupaia/ui-components';
import { useUpdateUserEntityPermission } from '../../api/mutations/useUpdateUserEntityPermission';

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
  }
`;

export const UserPermissionsCell = ({ value, row }) => {
  const [activeValue, setActiveValue] = React.useState(value);
  const { mutate: update, isLoading } = useUpdateUserEntityPermission();
  const { userEntityPermissionId, createdAt } = row.original;

  const handleChange = event => {
    const newValue = event.target.value;
    setActiveValue(newValue);
    update({
      userEntityPermissionId: userEntityPermissionId,
      permissionGroupName: newValue,
    });
  };

  const date = moment(createdAt).format('D MMMM YYYY');

  return (
    <Tooltip title={date} arrow placement="top" disableFocusListener disableTouchListener>
      <div>
        <StyledSelect
          id="permissions"
          disabled={isLoading}
          options={[
            { label: 'Public', value: 'LESMIS Public' },
            { label: 'Senior User', value: 'Laos Schools Super User' },
            { label: 'Admin', value: 'Laos Schools Admin' },
          ]}
          onChange={handleChange}
          value={activeValue}
          showPlaceholder={false}
          SelectProps={{
            IconComponent: iconProps => <ArrowDropDownIcon {...iconProps} />,
          }}
        />
      </div>
    </Tooltip>
  );
};
