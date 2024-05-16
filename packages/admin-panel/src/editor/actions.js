/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  EDITOR_DATA_EDIT_BEGIN,
  EDITOR_DATA_EDIT_SUCCESS,
  EDITOR_DATA_FETCH_BEGIN,
  EDITOR_DATA_FETCH_SUCCESS,
  EDITOR_DISMISS,
  EDITOR_ERROR,
  EDITOR_FIELD_EDIT,
  EDITOR_OPEN,
  SET_VALIDATION_ERRORS,
} from './constants';
import {
  convertSearchTermToFilter,
  getExplodedFields,
  makeSubstitutionsInString,
} from '../utilities';
import { getEditorState } from './selectors';
import { getFieldSourceToEdit } from './utils';

const STATIC_FIELD_TYPES = ['link'];

export const openBulkEditModal =
  ({ bulkGetEndpoint, bulkUpdateEndpoint, fields, title, baseFilter }, recordId, rowData) =>
  async (dispatch, getState, { api }) => {
    // explode the fields from any subsections
    const explodedFields = getExplodedFields(fields);
    if (recordId) {
      dispatch({
        type: EDITOR_DATA_FETCH_BEGIN,
        fields,
        title,
        endpoint: bulkUpdateEndpoint,
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
        dispatch({
          type: EDITOR_OPEN,
          fields,
          recordData: response.body,
          endpoint: bulkUpdateEndpoint,
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
        if (field.editConfig && field.editConfig.default) {
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
        type: EDITOR_OPEN,
        fields,
        recordData: {},
        endpoint: bulkUpdateEndpoint,
      });
    }
  };

export const openEditModal =
  (
    {
      editEndpoint,
      title,
      fields,
      FieldsComponent,
      extraDialogProps = {},
      isLoading = false,
      initialValues = {},
    },
    recordId,
  ) =>
  async (dispatch, getState, { api }) => {
    // explode the fields from any subsections
    const explodedFields = getExplodedFields(fields);
    // Open the modal instantly
    dispatch({
      type: EDITOR_OPEN,
      fields,
      FieldsComponent,
      title,
      recordData: {},
      endpoint: editEndpoint,
      extraDialogProps,
      isLoading,
      initialValues,
    });

    // And then fetch data / set default field values for edit/new respectively

    if (recordId) {
      const endpoint = `${editEndpoint}/${recordId}`;
      dispatch({
        type: EDITOR_DATA_FETCH_BEGIN,
        fields,
        title,
        endpoint,
        recordId,
      });

      try {
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
        if (field.editConfig && field.editConfig.default) {
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
    }
  };

export const editField = (fieldKey, newValue) => ({
  type: EDITOR_FIELD_EDIT,
  fieldKey,
  newValue,
});

const getIsFieldVisible = (field, recordData) => {
  const { visibilityCriteria } = field;
  if (!visibilityCriteria) {
    return true;
  }
  return Object.entries(visibilityCriteria).every(
    ([source, value]) => recordData[source] === value,
  );
};

const validateFields = (fields, recordData) => {
  return fields.reduce((errors, field) => {
    const sourceKey = getFieldSourceToEdit(field);
    const { type, required, editConfig } = field;

    // If the field is not visible, don't validate it
    if (!getIsFieldVisible(field, recordData)) {
      return errors;
    }
    // if the field is a section, validate its subfields
    if (field.type === 'section') {
      const { fields: sectionFields } = field;
      return {
        ...errors,
        ...validateFields(sectionFields, recordData),
      };
    }
    if (type === 'json' || editConfig?.type === 'json') {
      // sometimes the field has editConfig, sometimes it doesn't
      const { getJsonFieldSchema } = editConfig ?? field;
      const jsonFieldSchema = getJsonFieldSchema(null, { recordData });
      const jsonFields = jsonFieldSchema.map(jsonField => {
        const { fieldName } = jsonField;
        return { ...jsonField, source: fieldName };
      });
      const parseValue = () => {
        if (!recordData[sourceKey]) return {};
        if (typeof recordData[sourceKey] === 'string') {
          return JSON.parse(recordData[sourceKey]);
        }
        return recordData[sourceKey];
      };
      const parsedValue = parseValue();
      return {
        ...errors,
        ...validateFields(jsonFields, {
          ...recordData,
          ...parsedValue,
        }),
      };
    }

    const value = recordData[sourceKey];

    if (required && !value && value !== 0) {
      return {
        ...errors,
        [sourceKey]: '* Required',
      };
    }

    return errors;
  }, {});
};

// When editing a record, we only want to validate the fields that have been edited. If it's a new record, we want to validate all fields
const getFieldsToValidate = (fields, editedFields, isNew) => {
  if (isNew) return fields;
  return Object.keys(editedFields).reduce((fieldsToValidate, fieldKey) => {
    const fullField = fields.find(field => getFieldSourceToEdit(field) === fieldKey);
    if (!fullField) return fieldsToValidate;
    return [...fieldsToValidate, fullField];
  }, []);
};

const getValidationErrors = (fields, recordData, editedFields, isNew) => {
  const dataToValidate = getDataToValidate(editedFields, recordData, isNew);

  const fieldsToValidate = getFieldsToValidate(fields, editedFields, isNew);

  // if is bulk editing, recordData is an array of records. In this case, there is still only 1 fof each field displayed, so we just want to know if there are errors in any of the records
  if (Array.isArray(dataToValidate)) {
    const errors = {};
    dataToValidate.forEach(record => {
      const validationErrors = validateFields(fieldsToValidate, record);

      Object.entries(validationErrors).forEach(([key, error]) => {
        if (validationErrors[key]) {
          errors[key] = error;
        }
      });
    });
    return errors;
  }
  return validateFields(fieldsToValidate, dataToValidate);
};

const getDataToValidate = (editedFields, recordData, isNew) => {
  if (isNew) return editedFields;
  if (Array.isArray(recordData)) {
    return recordData.map((record, i) => {
      return {
        ...record,
        ...editedFields[i],
      };
    });
  }
  return {
    ...recordData,
    ...editedFields,
  };
};

export const saveEdits =
  (endpoint, editedFields, isNew, filesByFieldKey = {}) =>
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
        if (isNew) {
          await api.multipartPost({
            endpoint,
            filesByMultipartKey: filesByFieldKey,
            payload: editedFields,
          });
        } else {
          await api.multipartPut({
            endpoint,
            filesByMultipartKey: filesByFieldKey,
            payload: editedFields,
          });
        }
      } else {
        // eslint-disable-next-line
        if (isNew) {
          await api.post(endpoint, null, editedFields);
        } else {
          await api.put(endpoint, null, editedFields);
        }
      }

      dispatch({
        type: EDITOR_DATA_EDIT_SUCCESS,
      });
      dispatch(closeEditModal());
    } catch (error) {
      dispatch({
        type: EDITOR_ERROR,
        errorMessage: error.message,
      });
    }
  };

export const closeEditModal = () => ({
  type: EDITOR_DISMISS,
});
