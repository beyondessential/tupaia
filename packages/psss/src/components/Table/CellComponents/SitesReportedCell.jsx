import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Tooltip } from '@tupaia/ui-components';

const DottedUnderline = styled.div`
  display: inline-block;
  border-bottom: 1px dotted ${props => props.theme.palette.text.secondary};
`;

// Todo: use distanceInWordsToNow to get submitted time when data exists
//  @see https://app.zenhub.com/workspaces/sprint-board-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/1752
export const SitesReportedCell = ({ Sites, ...data }) => {
  if (Sites === undefined) {
    return '-';
  }

  return (
    <Tooltip title="Submitted 1 day ago" open={false}>
      <DottedUnderline>{`${data['Sites Reported']}/${Sites}`}</DottedUnderline>
    </Tooltip>
  );
};

SitesReportedCell.propTypes = {
  Sites: PropTypes.string,
};

SitesReportedCell.defaultProps = {
  Sites: undefined,
};
