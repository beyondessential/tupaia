/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import keyBy from 'lodash.keyby';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import styled from 'styled-components';
import { Alert, Button, SpinningLoader } from '@tupaia/ui-components';
import { Breadcrumbs } from '../../../layout';
import { useItemDetails } from '../../../api/queries/useResourceDetails';
import { withConnectedEditor } from '../../../editor';
import { useEditFiles } from '../../../editor/useEditFiles';
import { FileUploadField } from '../../../widgets/InputField/FileUploadField';
import { FieldsEditor } from '../../../editor/FieldsEditor';
import { dismissEditor, loadEditor, resetEdits } from '../../../editor/actions';

const Wrapper = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Form = styled.form`
  padding-inline: 1.5rem;
  padding-block-start: 0.9rem;
  flex: 1;
  overflow-y: ${({ $isLoading }) => ($isLoading ? 'hidden' : 'auto')};
`;

const Section = styled.section`
  padding-block-start: 1rem;
  padding-block-end: 1.8rem;

  &:last-child {
    border-top: 1px solid ${({ theme }) => theme.palette.grey[400]};
    padding-block-start: 1.8rem;
    padding-block-end: 0;
  }
  .MuiCardContent-root {
    padding: 0;
  }
  .MuiCard-root {
    border: none;
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    .fields {
      flex-direction: row;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      > div,
      > fieldset {
        width: 48%;
      }
    }
  }
`;

const SectionBlock = styled.div`
  > div {
    margin: 0;
  }
`;

const RowSection = styled(SectionBlock)`
  > div {
    display: flex;
    > fieldset:last-child {
      margin-left: 1.2rem;
    }
  }
`;

const StickyFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.palette.grey[400]};
  padding: 1.25rem;
`;

const ErrorAlert = styled(Alert)`
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
`;

const EditSurveyPageComponent = withConnectedEditor(
  ({
    parent,
    errorMessage,
    displayProperty,
    getDisplayValue,
    fields,
    recordData,
    onEditField,
    loadEditorData,
    isUnchanged,
    onSave,
    isLoading,
    resetEditorToDefaultState,
  }) => {
    const errorAlertRef = useRef(null);
    const navigate = useNavigate();
    const { '*': unusedParam, locale, ...params } = useParams();
    const { data: details } = useItemDetails(params, parent);

    useEffect(() => {
      const editorColumn = parent?.columns?.find(column => column.type === 'edit');
      if (!editorColumn) return;
      loadEditorData(editorColumn?.actionConfig, params.id);
    }, [params.id, JSON.stringify(parent)]);

    const { files, handleSetFormFile } = useEditFiles(fields, onEditField);

    const fieldsBySource = keyBy(fields, 'source');

    const {
      'project.code': projectCode,
      name,
      code,
      'permission_group.name': permissionGroupName,
      'survey_group.name': surveyGroupName,
      countryNames,
      period_granularity: periodGranularity,
      can_repeat: canRepeat,
      requires_approval: requiresApproval,
      'data_group.service_type': dataServiceType,
      'data_group.config': dataServiceConfig,
    } = fieldsBySource;

    const orderedFields =
      fields.length > 0
        ? [
            projectCode,
            name,
            code,
            permissionGroupName,
            surveyGroupName,
            periodGranularity,
            countryNames,
            {
              type: 'section',
              WrapperComponent: SectionBlock,
              fields: [
                {
                  type: 'section',
                  WrapperComponent: RowSection,
                  fields: [canRepeat, requiresApproval],
                },
                dataServiceType,
                dataServiceConfig,
              ],
            },
          ]
        : [];

    const navigateBack = () => {
      navigate('../../');
      resetEditorToDefaultState();
    };
    const handleSave = () => {
      onSave(files, navigateBack);
    };

    const initialFileName = Array.isArray(recordData?.surveyQuestions)
      ? null
      : recordData?.surveyQuestions;

    // on error, scroll to the error alert
    useEffect(() => {
      if (errorMessage && errorAlertRef.current) {
        errorAlertRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [errorMessage]);

    return (
      <Wrapper>
        <Breadcrumbs
          parent={parent}
          title={details?.name}
          displayProperty={displayProperty}
          details={details}
          getDisplayValue={getDisplayValue}
          onClickLinks={resetEditorToDefaultState}
        />

        <Form $isLoading={isLoading}>
          {isLoading && <SpinningLoader />}
          <ErrorAlert
            severity="error"
            ref={errorAlertRef}
            $show={!!errorMessage}
            aria-hidden={!!errorMessage}
          >
            {errorMessage}
          </ErrorAlert>
          <Section>
            <FileUploadField
              id="survey-questions"
              name="survey-questions"
              onChange={({ fileName, file }) =>
                handleSetFormFile('surveyQuestions', { fileName, file })
              }
              accept=".xlsx,.xls,.csv"
              initialFileName={initialFileName}
              label="Survey questions"
            />
          </Section>
          <Section>
            <FieldsEditor
              fields={orderedFields}
              recordData={recordData}
              onEditField={onEditField}
            />
          </Section>
        </Form>

        <StickyFooter>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUnchanged || isLoading}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </StickyFooter>
      </Wrapper>
    );
  },
);

EditSurveyPageComponent.propTypes = {
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  title: PropTypes.string,
  getDisplayValue: PropTypes.func,
  fields: PropTypes.object.isRequired,
  loadEditorData: PropTypes.func.isRequired,
};

EditSurveyPageComponent.defaultProps = {
  parent: null,
  displayProperty: 'id',
  title: '',
  getDisplayValue: null,
};

const mapDispatchToProps = dispatch => ({
  loadEditorData: (actionConfig, recordId) => dispatch(loadEditor(actionConfig, recordId)),
  resetEditorToDefaultState: () => {
    dispatch(dismissEditor());
    dispatch(resetEdits());
  },
});

export const EditSurveyPage = connect(null, mapDispatchToProps)(EditSurveyPageComponent);