/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import LibraryAddCheckOutlinedIcon from '@material-ui/icons/LibraryAddCheckOutlined';
import { Checkbox } from './Checkbox';
import { ColHeader } from './styles';
import { ALICE_BLUE } from './constant';

const SelectedDataColHeader = styled(ColHeader)`
  background: ${ALICE_BLUE};
`;

export const SelectedDataHeader = ({ selectedData, onChange, supportsDisableAll }) => {
  const isDisabledAll =
    selectedData.length > 0 ? !selectedData.some(option => !option.isDisabled) : false;
  return (
    <SelectedDataColHeader>
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
    </SelectedDataColHeader>
  );
};

SelectedDataHeader.propTypes = {
  selectedData: PropTypes.arrayOf({
    isDisabled: PropTypes.bool,
  }),
  supportsDisableAll: PropTypes.bool,
  onChange: PropTypes.func,
};

SelectedDataHeader.defaultProps = {
  selectedData: [],
  supportsDisableAll: false,
  onChange: () => {},
};
