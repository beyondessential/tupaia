/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-pgsql';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';

export const SQLEditor = props => {
  const { customKeywords, mode, onChange, value } = props;
  const editorName = 'sqlEditor';

  return (
    <AceEditor
      name={editorName}
      placeholder="Example: SELECT * FROM tablename"
      mode={mode}
      theme="xcode"
      value={value}
      onChange={onChange}
      editorProps={{
        $blockScrolling: true,
      }}
      setOptions={{ enableLiveAutocompletion: true }}
      onFocus={editor => {
        const sqlEditor = editor.view.ace.edit(editorName);
        sqlEditor.session.$mode.$highlightRules.$keywordList.push(...customKeywords);
        sqlEditor.session.$mode.$keywordList?.push(...customKeywords);
      }}
    />
  );
};

SQLEditor.propTypes = {
  customKeywords: PropTypes.string,
  mode: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

SQLEditor.defaultProps = {
  customKeywords: [],
  mode: 'pgsql',
  value: '',
};
