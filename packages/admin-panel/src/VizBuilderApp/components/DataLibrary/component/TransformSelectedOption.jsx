import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox as BaseCheckbox, FlexSpaceBetween } from '@tupaia/ui-components';
import { BaseSelectedOption } from './options';
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import styled from 'styled-components';

const FlexBetweenPanel = styled(FlexSpaceBetween)`
  width: 100%;
  height: auto;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Checkbox = styled(BaseCheckbox)`
  padding-right: 20px;
`;

export const TransformSelectedOption = ({ option, onChange, onRemove }) => {
  return (
    <FlexBetweenPanel>
      <Checkbox
        checkedIcon={<CheckBoxOutlinedIcon />}
        checked={!option.isDisabled}
        onChange={() => {
          const newOption = { ...option };
          newOption.isDisabled = !option.isDisabled;
          onChange(newOption);
        }}
        disableRipple
        size="small"
      />
      <BaseSelectedOption option={option} onRemove={onRemove} />
    </FlexBetweenPanel>
  );
};

TransformSelectedOption.defaultProps = {};

TransformSelectedOption.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};
