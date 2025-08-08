import React from 'react';
import PropTypes from 'prop-types';
import LibraryAddCheckOutlinedIcon from '@material-ui/icons/LibraryAddCheckOutlined';
import { Checkbox } from './Checkbox';
import { ColHeader } from './styles';

export const SelectedDataHeader = ({ selectedData, onChange, supportsDisableAll }) => {
  const isDisabledAll =
    selectedData.length > 0 ? !selectedData.some(option => !option.isDisabled) : false;
  return (
    <ColHeader>
      {supportsDisableAll && (
        <Checkbox
          checkedIcon={<LibraryAddCheckOutlinedIcon />}
          checked={!isDisabledAll}
          onChange={() => {
            const newSelectedData = selectedData.map(dataItem => ({
              ...dataItem,
              isDisabled: !isDisabledAll,
            }));
            onChange(undefined, newSelectedData);
          }}
          disableRipple
          size="small"
          style={{ paddingRight: '35px' }}
        />
      )}
      Selected Data
    </ColHeader>
  );
};

SelectedDataHeader.propTypes = {
  selectedData: PropTypes.array,
  supportsDisableAll: PropTypes.bool,
  onChange: PropTypes.func,
};

SelectedDataHeader.defaultProps = {
  selectedData: [],
  supportsDisableAll: false,
  onChange: () => {},
};
