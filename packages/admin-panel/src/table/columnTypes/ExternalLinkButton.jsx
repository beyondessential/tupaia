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
  const fullUrl = makeSubstitutionsInString(actionConfig.url, row.original);

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
