/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Select,
  TextField,
  FetchLoader,
  Autocomplete as ExternalDatabaseConnectionAutocomplete,
  DataGrid,
} from '@tupaia/ui-components';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { DataTableType } from '@tupaia/types';
import { PreviewFilters } from './components/PreviewFilters';
import { ReduxAutocomplete } from '../autocomplete';
import { SqlDataTableConfigEditFields } from './config';
import { useParams } from './useParams';
import { useDataTablePreview, useExternalDatabaseConnections } from './query';
import { getColumns, getRows } from '../utilities';
import { PlayButton } from './PlayButton';

const FieldWrapper = styled.div`
  padding: 7.5px;
`;

const StyledGrid = styled(Grid)`
  height: 400px;
`;

const dataTableTypeOptions = Object.values(DataTableType).map(type => ({
  label: type,
  value: type,
}));

const NoConfig = () => <>This Data Table type has no configuration options</>;

const typeFieldsMap = {
  ...Object.fromEntries(Object.values(DataTableType).map(type => [type, NoConfig])),
  [DataTableType.sql]: SqlDataTableConfigEditFields,
};

export const DataTableEditFields = React.memo(
  props => {
    const { onEditField, recordData, isLoading: isDataLoading } = props;
    if (isDataLoading) {
      return <div />;
    }

    const [fetchDisabled, setFetchDisabled] = useState(false);
    const [haveTriedToFetch, setHaveTriedToFetch] = useState(false); // prevent to show error when entering the page
    const { data: externalDatabaseConnections = [] } = useExternalDatabaseConnections();
    const {
      builtInParams,
      additionalParams,
      runtimeParams,
      upsertRuntimeParam,
      onParamsAdd,
      onParamsDelete,
      onParamsChange,
    } = useParams({
      onEditField,
      recordData,
    });

    useEffect(() => {
      const hasError = recordData?.config?.additionalParams?.some(p => p.hasError);
      setFetchDisabled(hasError === undefined ? false : !!hasError);
    }, [JSON.stringify(recordData)]);

    const {
      data: reportData = { columns: [], rows: [], limit: 0, total: 0 },
      refetch,
      isLoading,
      isFetching,
      isError,
      error,
    } = useDataTablePreview({
      previewConfig: recordData,
      runtimeParams,
      onSettled: () => {
        setFetchDisabled(false);
      },
    });

    const fetchPreviewData = () => {
      setHaveTriedToFetch(true);
      refetch();
    };

    const columns = useMemo(() => getColumns(reportData), [reportData]);
    const rows = useMemo(() => getRows(reportData), [reportData]);

    const ConfigComponent = typeFieldsMap[recordData.type] ?? null;

    const onChangeType = newType => {
      if (newType === DataTableType.sql) {
        onEditField('config', {
          sql: "SELECT * FROM analytics WHERE entity_code = 'DL';",
          externalDatabaseConnectionCode: null,
          additionalParams: [],
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
                value={recordData?.code}
                required
                error={haveTriedToFetch && !recordData.code}
                helperText={haveTriedToFetch && !recordData.code && 'should not be empty'}
                onChange={event => onEditField('code', event.target.value.trim())}
              />
            </FieldWrapper>
            <FieldWrapper>
              <TextField
                label="Description"
                name="description"
                value={recordData?.description}
                required
                error={haveTriedToFetch && !recordData.description}
                helperText={haveTriedToFetch && !recordData.description && 'should not be empty'}
                onChange={event => onEditField('description', event.target.value)}
              />
            </FieldWrapper>
            <FieldWrapper>
              <ReduxAutocomplete
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
                id="data-table-edit-type"
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
                <ExternalDatabaseConnectionAutocomplete // Provide options directly to base Autocomplete
                  options={externalDatabaseConnections}
                  label="Database Connection"
                  onChange={(event, selectedValues) =>
                    onSqlConfigChange('externalDatabaseConnectionCode', selectedValues?.code)
                  }
                  placeholder={recordData?.config?.externalDatabaseConnectionCode}
                  getOptionSelected={(option, selected) => option.code === selected.code}
                  getOptionLabel={option => option?.name || ''}
                  value={
                    externalDatabaseConnections.find(
                      connection =>
                        connection.code === recordData?.config?.externalDatabaseConnectionCode,
                    ) || {}
                  }
                />
              )}
            </FieldWrapper>
          </AccordionDetails>
        </Accordion>

        {ConfigComponent ? (
          <ConfigComponent
            onEditField={onEditField}
            recordData={recordData}
            additionalParams={additionalParams}
            onParamsAdd={onParamsAdd}
            onParamsDelete={onParamsDelete}
            onParamsChange={onParamsChange}
          />
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
                <PreviewFilters
                  params={[...additionalParams, ...builtInParams]}
                  onChange={upsertRuntimeParam}
                  runtimeParams={runtimeParams}
                />
                <PlayButton disabled={fetchDisabled} fetchPreviewData={fetchPreviewData} />
              </div>
              <StyledGrid item xs={12}>
                <FetchLoader
                  isLoading={isLoading || isFetching}
                  isError={isError}
                  error={error}
                  isNoData={!rows.length}
                  noDataMessage="No Data Found"
                >
                  <DataGrid rows={rows} columns={columns} autoPageSize />
                </FetchLoader>
              </StyledGrid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps.recordData) === JSON.stringify(nextProps.recordData);
  },
);

DataTableEditFields.propTypes = {
  onEditField: PropTypes.func.isRequired,
  recordData: PropTypes.object.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
