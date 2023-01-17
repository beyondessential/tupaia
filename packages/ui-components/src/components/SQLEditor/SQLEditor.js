/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-pgsql';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';

export const SQLEditor = props => {
  const [originalHighlightList, setOriginalHighlightList] = useState([]);

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
      setOptions={{ enableLiveAutocompletion: true, enableBasicAutocompletion: true }}
      onLoad={editor => {
        const { $keywordList: sqlKeywordList } = editor.session.$mode.$highlightRules;
        setOriginalHighlightList(sqlKeywordList);
      }}
      onFocus={editor => {
        const customKeywordList = customKeywords.map(key => ({
          caption: `:${key}`,
          value: `:${key}`,
          meta: 'custom-parameter',
        }));
        const sqlKeywordList = originalHighlightList.map(key => ({
          caption: `${key}`,
          value: `${key}`,
          meta: 'keyword',
        }));
        const wordCompleter = {
          identifierRegexps: [/[a-zA-Z_0-9:$\-\u00A2-\uFFFF]/],
          getCompletions: (_editor, _session, _pos, _prefix, callback) => {
            callback(null, [...sqlKeywordList, ...customKeywordList]);
          },
        };

        // eslint-disable-next-line no-param-reassign
        editor.view.ace.edit(editorName).completers = [wordCompleter];
      }}
    />
  );
};

SQLEditor.propTypes = {
  customKeywords: PropTypes.array,
  mode: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

SQLEditor.defaultProps = {
  customKeywords: [],
  mode: 'pgsql',
  value: '',
};
