import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  FetchLoader,
  Autocomplete as ExternalDatabaseConnectionAutocomplete,
  DataGrid,
} from '@tupaia/ui-components';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import { DataTableType } from '@tupaia/types';
import { PreviewFilters } from './components/PreviewFilters';
import { SqlDataTableConfigEditFields } from './config';
import { useParams } from './useParams';
import { useDataTablePreview, useExternalDatabaseConnections } from './query';
import { getColumns, getRows, labelToId } from '../utilities';
import { PlayButton } from './PlayButton';
import { onInputChange } from '../editor/FieldsEditor';
import { EditorInputField } from '../editor';

const StyledGrid = styled(Grid)`
  height: 400px;
`;

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  > div {
    width: 100%;
    &:not(:last-child) {
      margin-inline-end: 1rem;
    }
  }
`;

const NoConfig = () => <>This Data Table type has no configuration options</>;

const typeFieldsMap = {
  ...Object.fromEntries(Object.values(DataTableType).map(type => [type, NoConfig])),
  [DataTableType.sql]: SqlDataTableConfigEditFields,
};

export const DataTableEditFields = React.memo(
  props => {
    const { onEditField, recordData, isLoading: isDataLoading, fields } = props;
    if (isDataLoading) {
      return <div />;
    }

    const [fetchDisabled, setFetchDisabled] = useState(false);
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

    const getFieldBySource = source => fields.find(field => field.source === source);

    const sources = ['code', 'description', 'permission_groups', 'type'];

    const onChangeField = (inputKey, inputValue, editConfig) => {
      if (inputKey === 'type') {
        onChangeType(inputValue);
      } else onInputChange(inputKey, inputValue, editConfig, recordData, onEditField);
    };

    return (
      <div>
        <Accordion defaultExpanded>
          <AccordionSummary>Data Table</AccordionSummary>
          <AccordionDetails>
            <InputRow>
              {sources.map(source => {
                const field = getFieldBySource(source);
                const { Header, editConfig = {}, required, editable = true } = field;

                return (
                  <EditorInputField
                    key={source}
                    inputKey={source}
                    label={Header}
                    onChange={(key, inputValue) => onChangeField(key, inputValue, editConfig)}
                    value={recordData?.[source]}
                    disabled={!editable}
                    recordData={recordData}
                    id={`inputField-${labelToId(source)}`}
                    required={required}
                    editKey={source}
                    {...editConfig}
                  />
                );
              })}
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
            </InputRow>
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
                <PlayButton disabled={fetchDisabled} fetchPreviewData={refetch} />
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
  fields: PropTypes.array.isRequired,
};
