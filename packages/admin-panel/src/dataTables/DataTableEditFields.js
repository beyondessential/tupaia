/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Select, TextField, PreviewFilters, DataTable } from '@tupaia/ui-components';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { DataTableType } from '@tupaia/types';
import { Autocomplete } from '../autocomplete';
import { SqlDataTableConfigEditFields } from './config';
import { useDataTable } from './useDataTable';
import { useDataTablePreview } from './query';
import { getColumns } from '../utilities';
import { PlayButton } from './PlayButton';

const FieldWrapper = styled.div`
  padding: 7.5px;
`;

const StyledTable = styled(DataTable)`
  table {
    border-top: 1px solid ${({ theme }) => theme.palette.grey['400']};
    border-bottom: 1px solid ${({ theme }) => theme.palette.grey['400']};
    table-layout: auto;

    thead {
      text-transform: none;
    }
  }
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
  const [fetchDisabled, setFetchDisabled] = useState(false);

  useEffect(() => {
    if (recordData.config) {
      const hasError = recordData.config.additionalParameters.some(p => p.hasError);
      setFetchDisabled(hasError === undefined ? true : !!hasError);
    }
  }, [recordData]);

  const { additionalParameters, onParametersChange } = useDataTable({ onEditField, recordData });
  const {
    data: reportData = { columns: [], rows: [] },
    refetch,
    // isLoading,
    // isFetching,
    // isError,
    // error,
  } = useDataTablePreview({
    previewConfig: recordData,
    onSettled: () => {
      setFetchDisabled(false);
    },
  });
  const columns = useMemo(() => getColumns(reportData), [reportData]);
  const rows = useMemo(() => reportData.rows, [reportData]);

  const ConfigComponent = typeFieldsMap[recordData.type] ?? null;

  const onChangeType = newType => {
    if (newType === DataTableType.sql) {
      onEditField('config', {
        sql: "SELECT * FROM analytics WHERE entity_code = 'DL';",
        externalDatabaseConnectionCode: 'analytics_demo_land',
        additionalParameters: [],
      });
    } else {
      onEditField('config', {});
    }
    onEditField('type', newType);
  };

  const onSqlConfigChange = (field, newValue) => {
    if (recordData.type === DataTableType.sql) {
      onEditField('config', {
        ...recordData?.config,
        [field]: newValue,
      });
    }
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
              required
              onChange={event => onEditField('code', event.target.value)}
            />
          </FieldWrapper>
          <FieldWrapper>
            <TextField
              label="Description"
              name="description"
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
              value={recordData.permission_groups}
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
              value={recordData.type}
            />
          </FieldWrapper>
          <FieldWrapper>
            {recordData?.type === DataTableType.sql && (
              <TextField
                label="Database Connection"
                name="config.externalDatabaseConnectionCode"
                required
                onChange={event =>
                  onSqlConfigChange('externalDatabaseConnectionCode', event.target.value)
                }
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
          <Grid container spacing={2}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <PreviewFilters parameters={additionalParameters} onChange={onParametersChange} />
              <PlayButton disabled={fetchDisabled} refetch={refetch} />
            </div>
            <Grid item xs={12}>
              <StyledTable columns={columns} data={rows} rowLimit={100} />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

DataTableEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
};
