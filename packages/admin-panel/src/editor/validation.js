import { getExplodedFields } from '../utilities';
import { getFieldEditKey } from './utils';

export const REQUIRED_FIELD_ERROR = '* Required';

const getIsFieldVisible = (field, recordData) => {
  const { visibilityCriteria } = field;
  if (!visibilityCriteria) {
    return true;
  }
  return Object.entries(visibilityCriteria).every(
    ([source, value]) => recordData[source] === value,
  );
};

const validateData = (fields, data) => {
  return fields.reduce((errors, field) => {
    // get the key to check in the data - this is not always the same as what is returned from the endpoint

    const { editConfig = {} } = field;
    const fieldInfo = {
      ...field,
      ...editConfig,
    };

    const editKey = getFieldEditKey(fieldInfo);

    // if the field is a json array, explode it and validate each field
    if (fieldInfo.type === 'json') {
      const { getJsonFieldSchema } = fieldInfo;
      const jsonFieldSchema = getJsonFieldSchema(null, { recordData: data });
      const jsonFields = jsonFieldSchema.map(jsonField => {
        const { fieldName } = jsonField;
        return {
          ...jsonField,
          source: fieldName,
        };
      });

      // parse the parent field value, so we can validate the nested fields
      const parseValue = () => {
        if (!data[editKey]) return {};
        if (typeof data[editKey] === 'string') {
          return JSON.parse(data[editKey]);
        }
        return data[editKey];
      };
      const parsedValue = parseValue();

      return Object.assign(
        errors,
        validateData(jsonFields, {
          ...data,
          ...parsedValue,
        }),
      );
    }

    const isFieldVisible = getIsFieldVisible(fieldInfo, data);
    if (!isFieldVisible) return errors;
    if (!fieldInfo.required) return errors;

    const value = data[editKey];
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors[editKey] = REQUIRED_FIELD_ERROR;
    }

    return errors;
  }, {});
};

const extractData = (editedFields, recordData, explodedFields) => {
  // if is a bulk edit, editedFields is an array of records, but we just need to grab the first one to validate
  const editedValues = Array.isArray(editedFields) ? editedFields[0] : editedFields;
  const savedData = Array.isArray(recordData) ? recordData[0] : recordData;

  const combinedData = {
    ...savedData,
    ...editedValues,
  };

  // Map the data to the correct field key - this is useful in cases where we might be editing a saved record, and the field key from the endpoint is different to the source key we have configured
  return explodedFields.reduce((result, field) => {
    const editKey = getFieldEditKey(field);
    const { source } = field;
    result[editKey] = combinedData[combinedData.hasOwnProperty(editKey) ? editKey : source];

    return result;
  }, {});
};

export const getValidationErrors = (fields, recordData, editedFields) => {
  // explode fields that are nested in sections
  const explodedFields = getExplodedFields(fields);
  // extract the data to validate - this handles arrays of records
  const extractedData = extractData(editedFields, recordData, explodedFields);

  // extract the required fields
  return validateData(explodedFields, extractedData);
};
