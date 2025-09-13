import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import { FormLabel } from '@material-ui/core';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { checkVisibilityCriteriaAreMet, labelToId } from '../../utilities';
import { EditorInputField } from '../../editor';

const getJsonFieldValues = value => {
  if (value) {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        // If the field value is not valid json, ignore it.
      }
    } else {
      return value; // Is already a sane js object
    }
  }
  return {};
};

const DEFAULT_FIELD_TYPE = 'text';

const GreyCard = styled(Card)`
  background: #f9f9f9;
`;

const Container = styled.fieldset`
  position: relative;
  border: none;
  padding: 0px;
`;

const CardLabel = styled(FormLabel).attrs({
  component: 'legend',
})`
  display: block;

  font-size: 1rem;
  margin-block-end: 0.6rem;
`;

export const JsonInputField = props => {
  const {
    onChange,
    value,
    getJsonFieldSchema,
    disabled,
    label,
    secondaryLabel,
    variant,
    recordData,
    required,
    error,
  } = props;
  const jsonFieldValues = getJsonFieldValues(value);
  const jsonFieldSchema = getJsonFieldSchema(value, props);
  const CardVariant = variant === 'grey' ? GreyCard : Card;

  const onFieldValueChange = (fieldName, fieldValue, csv) => {
    const updatedFieldValue = csv ? fieldValue.split(',').map(val => val.trim()) : fieldValue;
    onChange({ ...jsonFieldValues, [fieldName]: updatedFieldValue });
  };

  return (
    <Container>
      <CardLabel gutterBottom required={required} error={error}>
        {label}
      </CardLabel>
      {secondaryLabel && <Typography gutterBottom>{secondaryLabel}</Typography>}
      <CardVariant variant="outlined">
        <CardContent>
          {jsonFieldSchema
            .filter(({ visibilityCriteria }) => {
              return checkVisibilityCriteriaAreMet(visibilityCriteria, recordData);
            })
            .map(field => {
              const {
                label: fieldLabel,
                fieldName,
                secondaryLabel: fieldSecondaryLabel,
                type = DEFAULT_FIELD_TYPE,
                csv,
                ...inputFieldProps
              } = field;
              return (
                <EditorInputField
                  id={`inputField-${labelToId(fieldName)}`}
                  key={fieldName}
                  label={fieldLabel}
                  source={fieldName}
                  secondaryLabel={fieldSecondaryLabel}
                  value={jsonFieldValues[fieldName]}
                  inputKey={fieldName}
                  onChange={(inputKey, fieldValue) => onFieldValueChange(inputKey, fieldValue, csv)}
                  disabled={disabled}
                  type={type}
                  {...inputFieldProps}
                  editKey={fieldName}
                />
              );
            })}
        </CardContent>
      </CardVariant>
    </Container>
  );
};

JsonInputField.propTypes = {
  label: PropTypes.string.isRequired,
  getJsonFieldSchema: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  secondaryLabel: PropTypes.string,
  variant: PropTypes.string,
  recordData: PropTypes.object,
  required: PropTypes.bool,
  error: PropTypes.bool,
};

JsonInputField.defaultProps = {
  value: {},
  disabled: false,
  secondaryLabel: null,
  variant: null,
  recordData: {},
  required: false,
  error: false,
};
