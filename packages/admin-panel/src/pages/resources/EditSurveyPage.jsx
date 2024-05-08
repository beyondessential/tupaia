/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router';
import { Breadcrumbs } from '../../layout';
import { useItemDetails } from '../../api/queries/useResourceDetails';

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
    </div>
  );
};
