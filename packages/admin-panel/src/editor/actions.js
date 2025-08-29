import {
  EDITOR_DATA_EDIT_BEGIN,
  EDITOR_DATA_EDIT_SUCCESS,
  EDITOR_DATA_FETCH_BEGIN,
  EDITOR_DATA_FETCH_SUCCESS,
  EDITOR_DISMISS,
  EDITOR_ERROR,
  EDITOR_FIELD_EDIT,
  SET_VALIDATION_ERRORS,
  LOAD_EDITOR,
  OPEN_EDIT_MODAL,
  RESET_EDITS,
} from './constants';
import {
  convertSearchTermToFilter,
  getExplodedFields,
  makeSubstitutionsInString,
} from '../utilities';
import { getEditorState } from './selectors';
import { getValidationErrors } from './validation';
import { fetchUsedBy } from '../usedBy';
import { getFieldEditKey } from './utils';

const STATIC_FIELD_TYPES = ['link'];

export const openBulkEditModal =
  ({ bulkGetEndpoint, bulkUpdateEndpoint, fields, title, baseFilter }, recordId, rowData) =>
  async (dispatch, getState, { api }) => {
    // explode the fields from any subsections
    const explodedFields = getExplodedFields(fields);
    dispatch(openEditModal(recordId));
    dispatch({
      type: LOAD_EDITOR,
      fields,
      endpoint: bulkUpdateEndpoint,
      title,
    });
    if (recordId) {
      dispatch({
        type: EDITOR_DATA_FETCH_BEGIN,
      });
      // Set up filter
      const filterString = JSON.stringify(convertSearchTermToFilter({ ...baseFilter }));

      try {
        const response = await api.get(makeSubstitutionsInString(bulkGetEndpoint, rowData), {
          filter: filterString.length > 0 ? filterString : undefined,
          columns: JSON.stringify(
            explodedFields
              .filter(field => !field.hideValue && !STATIC_FIELD_TYPES.includes(field.type)) // Ignore any that will be hidden, e.g. passwords
              .map(field => field.source),
          ), // Fetch fields based on their source
        });
        dispatch({
          type: EDITOR_DATA_FETCH_SUCCESS,
          recordData: response.body,
        });
      } catch (error) {
        dispatch({
          type: EDITOR_ERROR,
          errorMessage: error.message,
        });
      }
    } else {
      // set default values
      explodedFields.forEach(field => {
        if (field.editConfig?.default) {
          const {
            source: fieldKey,
            editConfig: { default: newValue },
          } = field;

          dispatch({
            type: EDITOR_FIELD_EDIT,
            fieldKey,
            newValue,
          });
        }
      });

      dispatch({
        type: LOAD_EDITOR,
        fields,
        recordData: {},
        endpoint: bulkUpdateEndpoint,
      });
    }
  };

export const openEditModal = recordId => ({
  type: OPEN_EDIT_MODAL,
  recordId,
});

export const loadEditor =
  (
    {
      editEndpoint,
      title,
      fields,
      FieldsComponent,
      extraDialogProps = {},
      isLoading = false,
      initialValues = {},
      recordType,
      displayUsedBy = false,
    },
    recordId,
  ) =>
  async (dispatch, getState, { api }) => {
    // explode the fields from any subsections
    const explodedFields = getExplodedFields(fields);
    const endpoint = recordId ? `${editEndpoint}/${recordId}` : editEndpoint;
    // Open the modal instantly
    dispatch({
      type: LOAD_EDITOR,
      fields,
      FieldsComponent,
      title,
      recordData: {},
      endpoint,
      extraDialogProps,
      isLoading,
      initialValues,
    });

    // And then fetch data / set default field values for edit/new respectively

    if (recordId) {
      dispatch({
        type: EDITOR_DATA_FETCH_BEGIN,
        recordId,
      });

      try {
        if (displayUsedBy) {
          dispatch(fetchUsedBy(recordType, recordId));
        }
        const response = await api.get(endpoint, {
          columns: JSON.stringify(
            explodedFields
              .filter(field => !field.hideValue && !STATIC_FIELD_TYPES.includes(field.type)) // Ignore any that will be hidden, e.g. passwords
              .map(field => field.source),
          ), // Fetch fields based on their source
        });

        dispatch({
          type: EDITOR_DATA_FETCH_SUCCESS,
          recordData: response.body,
        });
      } catch (error) {
        dispatch({
          type: EDITOR_ERROR,
          errorMessage: error.message,
        });
      }
    } else {
      // set default values
      explodedFields.forEach(field => {
        if (field.editConfig?.default) {
          dispatch({
            type: EDITOR_FIELD_EDIT,
            fieldKey: field.source,
            newValue: field.editConfig.default,
          });
        }
      });
    }
  };

export const editField = (fieldSource, newValue) => (dispatch, getState) => {
  const { fields } = getState().editor;
  const field = getExplodedFields(fields).find(f => f.source === fieldSource);
  if (!field) return;
  const editKey = getFieldEditKey(field); // this needs to be here, because there are several places that use this action, and they all need to edit the correct field.

  const otherValidationErrorsToClear =
    field.editConfig?.type === 'json' ? Object.keys(newValue) : [];

  // Edit key will be different in cases where we are editing a saved record, because the value that comes back from the server is not always keyed the same as the field source we have configured
  dispatch({
    type: EDITOR_FIELD_EDIT,
    fieldKey: editKey,
    newValue: newValue === '' ? null : newValue,
    otherValidationErrorsToClear,
  });
};

export const saveEdits =
  (endpoint, editedFields, isNew, filesByFieldKey = {}, onSuccess, onError) =>
  async (dispatch, getState, { api }) => {
    try {
      const { recordData, fields } = getEditorState(getState());

      const validationErrors = getValidationErrors(fields, recordData, editedFields, isNew);

      if (Object.keys(validationErrors).length > 0) {
        dispatch({
          type: SET_VALIDATION_ERRORS,
          payload: validationErrors,
        });
        return;
      }

      dispatch({
        type: EDITOR_DATA_EDIT_BEGIN,
      });

      if (filesByFieldKey && Object.keys(filesByFieldKey).length > 0) {
        const request = isNew ? api.multipartPost : api.multipartPut;
        await request({
          endpoint,
          filesByMultipartKey: filesByFieldKey,
          payload: editedFields,
        });
      } else {
        // eslint-disable-next-line
        const request = isNew ? api.post : api.put;
        await request(endpoint, null, editedFields);
      }

      dispatch({
        type: EDITOR_DATA_EDIT_SUCCESS,
      });
      onSuccess();
    } catch (error) {
      dispatch({
        type: EDITOR_ERROR,
        error,
      });
      onError?.(error);
    }
  };

export const dismissEditor = () => ({
  type: EDITOR_DISMISS,
});

export const resetEdits = () => ({
  type: RESET_EDITS,
});
