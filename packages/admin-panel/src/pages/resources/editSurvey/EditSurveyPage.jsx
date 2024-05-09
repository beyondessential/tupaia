/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Breadcrumbs } from '../../../layout';
import { useItemDetails } from '../../../api/queries/useResourceDetails';
import { ReduxAutocomplete } from '../../../autocomplete';
import { withConnectedEditor } from '../../../editor';
import { useEditSurveyField } from '../../../surveys/useEditSurveyField';
import { useEditFiles } from '../../../editor/useEditFiles';
import { FileUploadField } from '../../../widgets/InputField/FileUploadField';
import keyBy from 'lodash.keyby';

const Form = styled.form`
  padding: 1.5rem;
`;

const Section = styled.section`
  padding-block-end: 1.8rem;
  & + & {
    border-top: 1px solid ${({ theme }) => theme.palette.grey[400]};
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

    return (
      <div>
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
          <Section></Section>
        </Form>
      </div>
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
