/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FileUploadField } from '@tupaia/ui-components';
import { useParams } from 'react-router';
import { Breadcrumbs } from '../../layout';
import { useItemDetails } from '../../api/queries/useResourceDetails';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

const Section = styled.section`
  padding: 1rem;
`;

export const EditSurveyPage = ({ parent, title, displayProperty, getDisplayValue }) => {
  const { '*': unusedParam, locale, ...params } = useParams();
  const { data: details } = useItemDetails(params, parent);

  return (
    <div>
      <Breadcrumbs
        parent={parent}
        title={details?.name}
        displayProperty={displayProperty}
        details={details}
        getDisplayValue={getDisplayValue}
      />
      <Section>
        <Typography variant="h2" as="label" htmlFor="question-upload">
          Survey questions
        </Typography>
        <FileUploadField />
      </Section>
    </div>
  );
};

EditSurveyPage.propTypes = {
  parent: PropTypes.object,
  displayProperty: PropTypes.string,
  title: PropTypes.string,
  getDisplayValue: PropTypes.func,
};

EditSurveyPage.defaultProps = {
  parent: null,
  displayProperty: 'id',
  title: '',
  getDisplayValue: null,
};
