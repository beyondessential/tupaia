import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { JsonEditor } from './JsonEditor';

const EditorContainer = styled.div`
  > div {
    height: 100%;
  }

  // We don't want to show the drag-n-drop button
  button.jsoneditor-dragarea {
    display: none;
  }

  // We're re-purposing the menu button in the table, and it looks a lot nicer if that button is shown on the right side
  table.jsoneditor-tree {
    direction: rtl;
  }

  table.jsoneditor-tree > tbody > tr {
    cursor: auto;
  }

  table.jsoneditor-tree > tbody > tr > td {
    vertical-align: middle;
  }

  td:has(> table.jsoneditor-values) {
    width: auto;
    direction: ltr;
    padding-right: 0.3rem;
  }

  // We're hiding the button when not hovering on that field
  table.jsoneditor-tree > tbody > tr:hover {
    background-color: #e9f5ff;
  }

  // We're hiding the button when not hovering on that field or focussed on its inputs
  table.jsoneditor-tree
    > tbody
    > tr:has(.jsoneditor-removable):not(:hover):not(:has(.jsoneditor-field:focus)):not(
      :has(.jsoneditor-value:focus)
    )
    button.jsoneditor-contextmenu-button {
    visibility: hidden;
  }

  td:has(> button.jsoneditor-contextmenu-button) {
    text-align: center;
  }

  button.jsoneditor-contextmenu-button {
    display: inline-block;
    vertical-align: middle;
  }

  // This hides the menu button when looking at an expanded empty object
  tr.jsoneditor-append button.jsoneditor-contextmenu-button {
    display: none;
  }

  // Switches the menu button icon to the remove button icon
  tr:has(table.jsoneditor-removable) button.jsoneditor-contextmenu-button {
    background-position: -30px -6px;
    height: 12px;
    width: 12px;
  }

  // Switches the menu button icon to the insert button icon
  tr:has(table.jsoneditor-schema-root) button.jsoneditor-contextmenu-button {
    background-position: 0 0;
  }

  // Disable highlighting behaviour of JSON Editor
  .jsoneditor-highlight,
  .jsoneditor-selected {
    background-color: initial;
  }

  div.jsoneditor td.jsoneditor-tree {
    vertical-align: middle;
  }

  div.jsoneditor-tree table.jsoneditor-tree {
    width: unset;
  }
`;

/**
 * Recursively look through the schema to find what fields are available at the given path
 * @param {*} schema schema at current level of the path
 * @param {*} path remaining path to drill through in the schema
 * @param {*} currentJson json data at current level of the path (used to filter out fields currently in use)
 */
const getFieldAutocompleteOptions = (schema, path, currentJson) => {
  if (!schema.properties && !schema.additionalProperties) {
    return null;
  }

  if (path.length === 0) {
    // Recursion complete
    const usedFields = Object.keys(currentJson);
    const unusedFields = Object.keys(schema.properties).filter(
      field => !usedFields.includes(field),
    );
    return unusedFields;
  }

  const [nextPathDepth, ...restOfPath] = path;

  // schema.additionalProperties should be used if there are no explicit fields defined at that level
  const nextSchema = schema.properties?.[nextPathDepth] || schema.additionalProperties;
  return getFieldAutocompleteOptions(nextSchema || {}, restOfPath, currentJson[nextPathDepth]);
};

/**
 * Recursively look through the schema to find what options are available at the given path
 * @param {*} schema schema at current level of the path
 * @param {*} path remaining path to drill through in the schema
 */
const getValueAutocompleteOptions = (schema, path) => {
  if (path.length === 0) {
    // Recursion complete
    if (schema.enum) {
      return schema.enum; // There is a set list of options, just return these
    }
    if (schema.type === 'boolean') {
      return ['true', 'false']; // Booleans can only be true or false
    }
    return null;
  }

  const [nextPathDepth, ...restOfPath] = path;
  // schema.additionalProperties should be used if there are no explicit fields defined at that level
  const nextSchema = schema.properties?.[nextPathDepth] || schema.additionalProperties;
  return getValueAutocompleteOptions(nextSchema || {}, restOfPath);
};

const AUTOCOMPLETE_TRIGGER_STATES = {
  KEYDOWN: 'keydown',
  FOCUS: 'focus',
};

export const JsonTreeEditor = props => {
  const { schema: editorSchema, onChange, value: editorValue, ...restOfProps } = props;

  const editorRef = useRef(null);

  // Refresh the editor if the viz type changes so that we get the latest schema validation
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.setSchema(editorSchema);
    }
  }, [editorSchema]);

  const fieldAutocomplete = (path, json) =>
    getFieldAutocompleteOptions(editorRef.current.node.schema || {}, path, json);

  const valueAutocomplete = path =>
    getValueAutocompleteOptions(editorRef.current.node.schema || {}, path);

  const autocomplete = {
    filter: 'contain',
    trigger: AUTOCOMPLETE_TRIGGER_STATES.KEYDOWN,
    getOptions: (text, path, input, editor) =>
      input === 'field'
        ? fieldAutocomplete(path.slice(0, -1), editor.get())
        : valueAutocomplete(path),
  };
  const onCreateMenu = (items, { path }) => {
    const menu = [];

    // If the field can be removed, add the remove button to this list
    const removeButton = items.find(({ text }) => text === 'Remove');
    if (removeButton) {
      menu.push(removeButton);
    }

    const node = editorRef.current.node.findNodeByPath(path);
    if (node.type === 'array') {
      // Insert an item into an array
      menu.unshift({
        text: 'Insert',
        click: () => {
          node.setValue([...node.getValue(), '']);
          node.expand(false);
        },
      });
    }

    if (node.type === 'object') {
      // Add a key into an object
      menu.unshift({
        text: 'Insert',
        click: () => {
          node.setValue({ ...node.getValue(), '': '' });
          node.expand(false);
          node.findNodeByPath(['']).focus('field'); // Focus on the newly created field
        },
      });
    }

    // If just one option in the menu, we treat the menu button like it does that action
    if (menu.length === 1) {
      menu[0].click();
      return null;
    }

    return menu;
  };

  // Auto doesn't support converting to object, so adding the functionality here
  const convertToObjectOrArray = (event, path) => {
    if (event.type !== 'input') return;

    const jsonEditorNode = editorRef.current.node.findNodeByPath(path);
    if (jsonEditorNode.type === 'auto') {
      if (jsonEditorNode.value === '{}') {
        jsonEditorNode.setValue({});
      }
      if (jsonEditorNode.value === '[]') {
        jsonEditorNode.setValue([]);
      }
    }
  };

  const updateAutocompleteTrigger = ({ field }) => {
    if (field === '') {
      // Show all options if we clear the field input (to make it easy to find possible options)
      editorRef.current.options.autocomplete.trigger = AUTOCOMPLETE_TRIGGER_STATES.FOCUS;
    } else {
      editorRef.current.options.autocomplete.trigger = AUTOCOMPLETE_TRIGGER_STATES.KEYDOWN;
    }
  };

  const onEvent = (node, event) => {
    switch (event.type) {
      case 'input': {
        convertToObjectOrArray(event, node.path);
        updateAutocompleteTrigger(node);
        break;
      }
      case 'blur': {
        // Reset autocomplete
        editorRef.current.options.autocomplete.trigger = AUTOCOMPLETE_TRIGGER_STATES.KEYDOWN;
        editorRef.current.refresh(); // Updates tooltips
        break;
      }
      default: {
        // Do nothing
      }
    }
  };

  // Add some custom classes to the fields so we know how to style their menu buttons
  const onClassName = ({ path, value }) => {
    const extraClasses = [];

    if (path.length === 0) {
      extraClasses.push('jsoneditor-schema-root');
    }

    if (typeof value !== 'object') {
      extraClasses.push('jsoneditor-removable');
    }

    return extraClasses;
  };

  const languages = {
    en: {
      // Overriding the default tooltip text with non-falsy empty string since we are repurposing the button
      // eslint-disable-next-line no-new-wrappers
      actionsMenu: new String(''),
    },
  };

  return (
    <EditorContainer>
      <JsonEditor
        mode="tree"
        history
        onChange={onChange}
        value={editorValue}
        schema={editorSchema}
        autocomplete={autocomplete}
        enableSort={false}
        enableTransform={false}
        onCreateMenu={onCreateMenu}
        onEvent={onEvent}
        onClassName={onClassName}
        languages={languages}
        editorRef={ref => {
          editorRef.current = ref;
        }}
        {...restOfProps}
      />
    </EditorContainer>
  );
};

JsonTreeEditor.propTypes = {
  schema: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
};

JsonTreeEditor.defaultProps = {
  schema: undefined,
};
