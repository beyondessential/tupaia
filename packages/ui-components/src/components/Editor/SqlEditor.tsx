/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import parser from 'js-sql-parser';
import BaseAceEditor from 'react-ace';
import styled from 'styled-components';
import 'ace-builds/src-noconflict/mode-pgsql';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';
import type { Ace } from 'ace-builds';

const editorName = 'sqlEditor';

const AceEditor = styled(BaseAceEditor)`
  .error-marker {
    z-index: 20;
    position: absolute;
    border-bottom: 2px dashed red;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`;

type SqlEditorProps = {
  customKeywords?: string[];
  enableBasicAutocompletion?: boolean;
  enableLiveAutocompletion?: boolean;
  mode?: 'mysql' | 'pgsql' | 'sql';
  onChange: (newValue: string) => unknown;
  placeholder?: string;
  tables?: string[];
  value?: string;
};

export const SqlEditor = ({
  customKeywords = [],
  enableBasicAutocompletion = false,
  enableLiveAutocompletion = false,
  mode = 'pgsql',
  onChange,
  placeholder = 'SELECT * FROM tablename',
  tables = [],
  value = '',
}: SqlEditorProps) => {
  const [originalHighlightList, setOriginalHighlightList] = useState([]);
  const [annotations, setAnnotations] = useState<Ace.Annotation>({ text: '', type: '' });
  const validateQuery = (query: string) => {
    // need to do this to add nextline \n
    let cleanedQuery = query;
    while (cleanedQuery.includes(':')) cleanedQuery = cleanedQuery.replace(':', '-');
    const queryArray = cleanedQuery.split('\n');
    const sqlQuery = queryArray.join('\n');
    try {
      parser.parse(sqlQuery);
      setAnnotations({ text: '', type: '' });
    } catch (e) {
      // Errors will be:
      // [
      //   'Parse error on line 2:',
      //   "...23123123123213' and ",
      //   "-----------------------^"
      //   "Expecting '(', 'NUMERIC', 'IDENTIFIER', 'STRING', 'EXPONENT_NU...",
      // ];
      const errors = (e as Error).message.split('\n');
      const rowNum = parseInt(errors[0].split(' ')[4].replace(':', ''));
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

  return (
    <AceEditor
      enableLiveAutocompletion={enableLiveAutocompletion}
      enableBasicAutocompletion={enableBasicAutocompletion}
      name={editorName}
      placeholder={placeholder}
      mode={mode}
      theme="github"
      showPrintMargin={false}
      width="100%"
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
        // @ts-ignore We're looking under the hood here
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
        const tableList = tables.map(key => ({
          caption: `${key}`,
          value: `${key}`,
          meta: 'table',
        }));
        const wordCompleter = {
          identifierRegexps: [/[a-zA-Z_0-9:$\-\u00A2-\uFFFF]/],
          getCompletions: (_editor: any, _session: any, _pos: any, _prefix: any, callback: any) => {
            callback(null, [...sqlKeywordList, ...customKeywordList, ...tableList]);
          },
        };

        // eslint-disable-next-line no-param-reassign
        editor.view.ace.edit(editorName).completers = [wordCompleter];
      }}
      annotations={[annotations]}
      markers={[
        {
          type: 'text',
          startRow: annotations.row || 0,
          endRow: annotations.row || 0,
          startCol: annotations.column || 0,
          endCol: (annotations.column || 0) + 2,
          className: 'error-marker',
        },
      ]}
    />
  );
};
