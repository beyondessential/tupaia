/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { VizGroupNiceName, VizTypeNiceName, VizTypesByGroup } from '@tupaia/types';
import PropTypes from 'prop-types';
import React from 'react';
import { GroupedSelect, Tooltip } from '@tupaia/ui-components';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';

const VizTypeSelectorContainer = styled.div`
  padding: 1em;
`;

export const VizTypeSelector = ({ value, onChange }) => {
  const groupedOptions = {};
  for (const groupName of Object.keys(VizTypesByGroup)) {
    const groupNiceName = VizGroupNiceName[groupName];
    groupedOptions[groupNiceName] = VizTypesByGroup[groupName].map(vizType => ({
      label: VizTypeNiceName[vizType],
      value: vizType,
    }));
  }

  const tooltipContent = (
    <Typography variant="body2">
      View{' '}
      <MuiLink
        href="https://beyond-essential.slab.com/posts/presentation-configuration-bd7jvnps#h26fd-dashboard-item"
        color="inherit"
      >
        documentation for JSON Editor
      </MuiLink>
    </Typography>
  );

  return (
    <VizTypeSelectorContainer>
      <GroupedSelect
        id="viz-type-selector"
        label="Visualisation type"
        value={value}
        onChange={e => e.target.value && onChange(e.target.value)}
        groupedOptions={groupedOptions}
      />
      <Tooltip title={tooltipContent} interactive>
        <Button>
          Editor help <InfoRoundedIcon />
        </Button>
      </Tooltip>
    </VizTypeSelectorContainer>
  );
};

VizTypeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
