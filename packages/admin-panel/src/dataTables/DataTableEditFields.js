/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Select, TextField, PreviewFilters } from '@tupaia/ui-components';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { DataTableType } from '@tupaia/types';
import { Autocomplete } from '../autocomplete';
import { SqlDataTableConfigEditFields } from './config';
import { useDataTable } from './useDataTable';

const FieldWrapper = styled.div`
  padding: 7.5px;
`;

const dataTableTypeOptions = Object.values(DataTableType).map(type => ({
  label: type,
  value: type,
}));

const NoConfig = () => <>This Data Table type has no configuration options</>;

const typeFieldsMap = {
  [DataTableType.sql]: SqlDataTableConfigEditFields,
  [DataTableType.analytics]: NoConfig,
  [DataTableType.entities]: NoConfig,
  [DataTableType.entity_relations]: NoConfig,
  [DataTableType.events]: NoConfig,
};

export const DataTableEditFields = ({ onEditField, recordData }) => {
  const { additionalParameters, onParametersChange } = useDataTable({ onEditField, recordData });

  const ConfigComponent = typeFieldsMap[recordData.type] ?? null;

  const onChangeType = newType => {
    if (newType === DataTableType.sql) {
      onEditField('config', {
        sql: "SELECT * FROM analytics WHERE entity_code = 'DL';",
        externalDatabaseConnectionCode: 'analytics_demo_land',
      });
    } else {
      onEditField('config', {});
    }
    onEditField('type', newType);
  };

  return (
    <div>
      <Accordion defaultExpanded>
        <AccordionSummary>Data Table</AccordionSummary>
        <AccordionDetails>
          <FieldWrapper>
            <TextField
              label="Code"
              name="code"
              value={recordData?.code}
              required
              onChange={event => onEditField('code', event.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper>
            <TextField
              label="Description"
              name="description"
              value={recordData?.description}
              required
              onChange={event => onEditField('description', event.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper>
            <Autocomplete
              allowMultipleValues
              key="permission_groups"
              inputKey="permission_groups"
              label="Permission Groups"
              onChange={selectedValues => onEditField('permission_groups', selectedValues)}
              placeholder={recordData.permission_groups}
              id="inputField-permission_groups"
              reduxId="dataTableEditFields-permission_groups"
              endpoint="permissionGroups"
              optionLabelKey="name"
              optionValueKey="name"
            />
          </FieldWrapper>
          <FieldWrapper>
            <Select
              id="data-table-edit--type"
              label="Type"
              name="type"
              required
              options={dataTableTypeOptions}
              onChange={event => onChangeType(event.target.value)}
              value={recordData?.type}
            />
          </FieldWrapper>
          <FieldWrapper>
            {recordData?.type === DataTableType.sql && (
              <TextField
                label="Database Connection"
                name="config.externalDatabaseConnectionCode"
                required
                inputProps={{ readOnly: true }}
                value={recordData?.config?.externalDatabaseConnectionCode || ''}
              />
            )}
          </FieldWrapper>
        </AccordionDetails>
      </Accordion>

      {ConfigComponent ? (
        <ConfigComponent onEditField={onEditField} recordData={recordData} />
      ) : (
        <Accordion defaultExpanded>
          <AccordionSummary>Config</AccordionSummary>
        </Accordion>
      )}

      <Accordion defaultExpanded>
        <AccordionSummary>Preview</AccordionSummary>
        <AccordionDetails>
          <PreviewFilters parameters={additionalParameters} onChange={onParametersChange} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

DataTableEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
