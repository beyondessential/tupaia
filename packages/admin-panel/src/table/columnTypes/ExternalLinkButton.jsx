/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@material-ui/core';
import { OpenInNewRounded } from '@material-ui/icons';
import { ColumnActionButton } from './ColumnActionButton';
import { makeSubstitutionsInString } from '../../utilities';

export const ExternalLinkButton = ({ actionConfig, row }) => {
  const getUrl = () => {
    if (actionConfig.generateUrl) {
      return actionConfig.generateUrl(row.original);
    }
    return makeSubstitutionsInString(actionConfig.url, row.original);
  };
  const fullUrl = getUrl();
  if (!fullUrl) return null;

  return (
    <ColumnActionButton
      className="link-button"
      title={actionConfig.title}
      component={Link}
      href={fullUrl}
      target="_blank"
    >
      <OpenInNewRounded />
    </ColumnActionButton>
  );
};

ExternalLinkButton.propTypes = {
  actionConfig: PropTypes.object.isRequired,
  row: PropTypes.object.isRequired,
};
