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
        // const { $keywordList: keywordList } = editor.session.$mode.$highlightRules;
        // setOriginalHighlightList(keywordList);
        const staticWordCompleter = {
          getCompletions: (editor, session, pos, prefix, callback) => {
            callback(
              null,
              customKeywords.map(word => {
                return {
                  caption: `:${word}`,
                  value: `:${word}`,
                  meta: 'static',
                };
              }),
            );
          },
        };

        editor.completers = [staticWordCompleter];
      }}
      // onFocus={editor => {
      //   const sqlEditor = editor.view.ace.edit(editorName);
      //   const newKeyWordList = Array.from(
      //     new Set([...originalHighlightList, ...customKeywords.map(key => `:${key}`)]),
      //   );
      //   sqlEditor.session.$mode.$highlightRules.$keywordList = newKeyWordList;
      //   sqlEditor.session.$mode.$keywordList = newKeyWordList;
      // }}
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
