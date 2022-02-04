import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DownArrow from '@material-ui/icons/ArrowDropDown';
import styled from 'styled-components';
import { BaseSelectedOption, JsonEditor } from '@tupaia/ui-components/';

const Panel = styled.div`
  width: 100%;
`;

const JsonEditorPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  > div {
    width: 100%;
    height: 250px;
  }

  .jsoneditor {
    border: none;
    cursor: text;
  }
`;

const OptionPanelWithJsonEditor = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  height: auto;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const DownArrowIconWrapper = styled.div`
  display: flex;
  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
    transform: rotate(${({ $expanded }) => ($expanded ? '0deg' : '-90deg')});
  }
`;

export const SelectedOptionWithJsonEditor = ({
  option,
  onChange,
  onRemove,
  setEdittingOption,
  optionMetaData,
  onInvalidChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentValue = {
    type: option.code,
    config: option?.config || {
      dataSourceEntityType: '',
      aggregationEntityType: '',
    },
  };

  return (
    <OptionPanelWithJsonEditor>
      <DownArrowIconWrapper $expanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)}>
        <DownArrow />
      </DownArrowIconWrapper>
      <Panel>
        <BaseSelectedOption option={{ ...optionMetaData, ...option }} onRemove={onRemove} />
        {isExpanded && (
          <JsonEditorPanel
            onMouseOver={() => setEdittingOption(option.code)}
            onMouseLeave={() => setEdittingOption(null)}
          >
            <JsonEditor
              value={currentValue}
              mode="code"
              mainMenuBar={false}
              onChange={onChange}
              schema={optionMetaData?.schema || {}}
              onValidationError={error => {
                console.log(error);
                if (error.length !== 0) {
                  onInvalidChange();
                }
              }}
            />
          </JsonEditorPanel>
        )}
      </Panel>
    </OptionPanelWithJsonEditor>
  );
};

SelectedOptionWithJsonEditor.defaultProps = {
  optionMetaData: {},
};

SelectedOptionWithJsonEditor.propTypes = {
  option: PropTypes.shape({
    code: PropTypes.string.isRequired,
    config: PropTypes.object,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  optionMetaData: PropTypes.shape({
    code: PropTypes.string,
    schema: PropTypes.object,
    description: PropTypes.string,
  }),
  setEdittingOption: PropTypes.func.isRequired,
  onInvalidChange: PropTypes.func.isRequired,
};
