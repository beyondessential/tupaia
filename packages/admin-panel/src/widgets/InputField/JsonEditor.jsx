import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import { InputLabel } from '@tupaia/ui-components';

import { JsonEditor as Editor } from '../JsonEditor';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  margin-bottom: 20px;

  .jsoneditor-parent {
    display: flex;
    flex: 1;
  }

  .jsoneditor {
    height: auto;
    border-color: ${({ theme, $invalid }) => {
      return $invalid ? theme.palette.error.main : theme.palette.text.primary;
    }};
  }

  .jsoneditor:has(:focus-visible) {
    border-color: ${props => props.theme.palette.primary.main};
    border-width: max(0.0625rem, 1px);
  }

  .jsoneditor-parent,
  .jsoneditor,
  .jsoneditor-outer,
  .ace_editor {
    border-radius: 0.1875rem;
  }
`;

export const JsonEditor = ({
  inputKey,
  label,
  value,
  onChange,
  stringify,
  error,
  required,
  tooltip,
}) => {
  let editorValue = value;

  if (typeof value === 'string') {
    editorValue = JSON.parse(value);
  }

  return (
    <Container $invalid={error}>
      <InputLabel
        label={label}
        labelProps={{
          required,
          error,
        }}
        tooltip={tooltip}
        applyWrapper
      />
      {/* Use json editor plugin. For configuration options @see https://github.com/vankop/jsoneditor-react */}
      <Editor
        mainMenuBar={false}
        statusBar={false}
        mode="code"
        onChange={json => onChange(inputKey, stringify ? JSON.stringify(json ?? {}) : json)}
        value={editorValue}
        htmlElementProps={{
          className: 'jsoneditor-parent',
        }}
      />
    </Container>
  );
};

JsonEditor.propTypes = {
  inputKey: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  stringify: PropTypes.bool,
  error: PropTypes.bool,
  required: PropTypes.bool,
  tooltip: PropTypes.string,
};

JsonEditor.defaultProps = {
  value: null,
  stringify: true,
  error: false,
  required: false,
  tooltip: null,
};
