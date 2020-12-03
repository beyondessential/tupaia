/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { distanceInWordsToNow } from 'date-fns';
import styled from 'styled-components';
import { Tooltip } from '@tupaia/ui-components';

const DottedUnderline = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

// Todo: use distanceInWordsToNow to get submitted time when data exists
export const SitesReportedCell = ({ Sites, ...data }) => {
  if (Sites === undefined) {
    return '-';
  }

  return (
    <Tooltip title="Submitted: 1 day ago">
      <DottedUnderline>{`${data['Sites Reported']}/${Sites}`}</DottedUnderline>
    </Tooltip>
  );
};

SitesReportedCell.defaultProps = {
  Sites: PropTypes.string,
};

SitesReportedCell.defaultProps = {
  Sites: undefined,
};
