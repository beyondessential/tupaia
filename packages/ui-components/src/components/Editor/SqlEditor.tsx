import React, { useState } from 'react';
import parser from 'js-sql-parser';
import BaseAceEditor from 'react-ace';
import styled from 'styled-components';
import 'ace-builds/src-noconflict/mode-pgsql';
import 'ace-builds/src-noconflict/ext-language_tools';
import type { Ace } from 'ace-builds';

const editorName = 'sqlEditor';

const AceEditor = styled(BaseAceEditor).attrs({
  maxLines: 30,
  minLines: 6,
  showPrintMargin: false,
  tabSize: 2,
  theme: 'xcode',
  width: '100%',
  setOptions: {
    enableLiveAutocompletion: true,
    enableBasicAutocompletion: true,
  },
})`
  border: 1px solid #dedee0; // GREY_DE from admin-panel
  border-radius: 3px;
  // font-size set by fontSize prop
  line-height: 1.5;

  /* 
   * Prevent caret drift in some browsers, including Safari.
   * 
   * Ace uses CSS properties to calculate the width of characters and lines, which determines where 
   * the caret should appear. However, when a font style isn’t provided by the font files, and the
   * browser attempts to synthesize it, this can cause the caret to lag behind or lead ahead of the
   * actual insertion point.
   */
  font-synthesis: none;

  .ace_placeholder {
    font-family: inherit;
    font-style: normal;
    margin-left: unset;
    transform: unset;
  }

  .ace_tooltip {
    font-size: 0.75rem;
    max-width: 72ch;
    text-wrap: unset;
  }

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
  /**
   * Pixel value for `font-size`
   */
  fontSize?: number;
  mode?: 'mysql' | 'pgsql' | 'sql';
  onChange: (newValue: string) => unknown;
  placeholder?: string;
  tables?: string[];
  value?: string;
  wrapEnabled?: boolean;
};

export const SqlEditor = ({
  customKeywords = [],
  fontSize = 14,
  mode = 'pgsql', // sql and mysql modes don’t seem to have syntax highlighting
  onChange,
  placeholder = 'SELECT * FROM tablename',
  tables = [],
  value = '',
  wrapEnabled = true,
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
  const onFocus = (editor: any) => {
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
  };
  const configureSyntaxHighlighting = (editor: any) => {
    // @ts-ignore We're looking under the hood here
    const { $keywordList: sqlKeywordList } = editor.session.$mode.$highlightRules;
    setOriginalHighlightList(sqlKeywordList);
  };

  const markers = [
    {
      type: 'text' as const,
      startRow: annotations.row || 0,
      endRow: annotations.row || 0,
      startCol: annotations.column || 0,
      endCol: (annotations.column || 0) + 2,
      className: 'error-marker',
    },
  ];

  return (
    <AceEditor
      annotations={[annotations]}
      editorProps={{
        $blockScrolling: true,
        $useWorker: false,
      }}
      fontSize={fontSize}
      mode={mode}
      name={editorName}
      onChange={newQuery => {
        validateQuery(newQuery);
        onChange(newQuery);
      }}
      markers={markers}
      onFocus={onFocus}
      onLoad={configureSyntaxHighlighting}
      placeholder={placeholder}
      value={value}
      wrapEnabled={wrapEnabled}
    />
  );
};
