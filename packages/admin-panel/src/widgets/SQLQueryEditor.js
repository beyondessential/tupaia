/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import parser from 'js-sql-parser';
import BaseAceEditor from 'react-ace';
import styled from 'styled-components';

import 'ace-builds/src-noconflict/mode-pgsql';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';

const AceEditor = styled(BaseAceEditor)`
  .error-marker {
    z-index: 20;
    position: absolute;
    border-bottom-width: 2px;
    border-bottom-color: red;
    border-bottom-style: dashed;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }
`;

export const SQLQueryEditor = props => {
  const [originalHighlightList, setOriginalHighlightList] = useState([]);
  const [annotations, setAnnotations] = useState({});
  const validateQuery = query => {
    // need to do this to add nextline \n
    const queryArray = query.replaceAll(':', '-').split('\n');
    const sqlQuery = queryArray.join('\n');
    try {
      parser.parse(sqlQuery);
      setAnnotations({});
    } catch (e) {
      // errors will be:
      // [
      //   'Parse error on line 2:',
      //   "...23123123123213' and ",
      //   "-----------------------^"
      //   "Expecting '(', 'NUMERIC', 'IDENTIFIER', 'STRING', 'EXPONENT_NU...",
      // ];
      const errors = e.message.split('\n');
      const rowNum = errors[0].split(' ')[4].replace(':', '');
      if (errors[1].startsWith('...')) {
        errors[1] = errors[1].substring(3);
        errors[2] = errors[2].substring(3);
      }
      let errorIndex = queryArray.join('').indexOf(errors[1]) + errors[2].length;
      for (let i = 0; i < Math.floor(rowNum) - 1; i++) {
        errorIndex -= queryArray[i].length;
      }

      setAnnotations({
        row: Math.floor(rowNum) - 1,
        column: errorIndex - 2,
        type: 'error',
        text: errors[3],
      });
    }
  };

  const { customKeywords, mode, onChange, value } = props;
  const editorName = 'sqlEditor';

  return (
    <AceEditor
      name={editorName}
      placeholder="Example: SELECT * FROM tablename"
      mode={mode}
      theme="xcode"
      showPrintMargin={false}
      width="auto"
      value={value}
      onChange={newQuery => {
        validateQuery(newQuery);
        onChange(newQuery);
      }}
      editorProps={{
        $blockScrolling: true,
        $useWorker: false,
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
      annotations={[annotations]}
      markers={[
        {
          startRow: annotations.row,
          endRow: annotations.row,
          startCol: annotations.column,
          endCol: annotations.column + 2,
          className: 'error-marker',
        },
      ]}
    />
  );
};

SQLQueryEditor.propTypes = {
  customKeywords: PropTypes.array,
  mode: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

SQLQueryEditor.defaultProps = {
  customKeywords: [],
  mode: 'pgsql',
  value: '',
};
