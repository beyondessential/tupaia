/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import keyBy from 'lodash.keyby';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Breadcrumbs } from '../../../layout';
import { useItemDetails } from '../../../api/queries/useResourceDetails';
import { withConnectedEditor } from '../../../editor';
import { useEditSurveyField } from '../../../surveys/useEditSurveyField';
import { useEditFiles } from '../../../editor/useEditFiles';
import { FileUploadField } from '../../../widgets/InputField/FileUploadField';

import { FieldsEditor } from '../../../editor/FieldsEditor';

const Wrapper = styled.div`
  overflow: hidden;
`;

const Form = styled.form`
  padding: 1.5rem;
  max-height: 100%;
  overflow-y: auto;
`;

const Section = styled.section`
  padding-block-end: 1.8rem;
  container-type: normal;
  & + & {
    border-top: 1px solid ${({ theme }) => theme.palette.grey[400]};
    padding-block-start: 1.8rem;
  }

  @media screen and (min-width: 1200px) {
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

export const EditSurveyPage = withConnectedEditor(
  ({
    parent,
    title,
    displayProperty,
    getDisplayValue,
    fields,
    recordData,
    onEditField,
    loadEditor,
  }) => {
    const { '*': unusedParam, locale, ...params } = useParams();
    const { data: details } = useItemDetails(params, parent);

    useEffect(() => {
      const editorColumn = parent?.columns?.find(column => column.type === 'edit');
      if (!editorColumn) return;
      loadEditor(editorColumn?.actionConfig, params.id);
    }, [params.id, JSON.stringify(parent)]);

    const handleEditField = useEditSurveyField(recordData, onEditField);

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

    const orderedFields = fields.length
      ? [
          projectCode,
          name,
          code,
          permissionGroupName,
          {
            type: 'section',
            WrapperComponent: SectionBlock,
            fields: [
              surveyGroupName,
              periodGranularity,
              {
                type: 'section',
                WrapperComponent: RowSection,
                fields: [canRepeat, requiresApproval],
              },
            ],
          },
          countryNames,
          dataServiceType,
          dataServiceConfig,
        ]
      : [];

    return (
      <Wrapper>
        <Breadcrumbs
          parent={parent}
          title={details?.name}
          displayProperty={displayProperty}
          details={details}
          getDisplayValue={getDisplayValue}
        />
        <Form>
          <Section>
            <FileUploadField
              id="survey-questions"
              name="survey-questions"
              onChange={({ fileName, file }) =>
                handleSetFormFile('surveyQuestions', { fileName, file })
              }
              accept=".json"
              fileName={recordData?.surveyQuestions?.fileName}
              label="Survey questions"
            />
          </Section>
          <Section>
            <FieldsEditor
              fields={orderedFields}
              recordData={recordData}
              onEditField={handleEditField}
              onSetFormFile={handleSetFormFile}
            />
          </Section>
        </Form>
      </Wrapper>
    );
  },
);

EditSurveyPage.propTypes = {
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  title: PropTypes.string,
  getDisplayValue: PropTypes.func,
  fields: PropTypes.object.isRequired,
};

EditSurveyPage.defaultProps = {
  parent: null,
  displayProperty: 'id',
  title: '',
  getDisplayValue: null,
};
