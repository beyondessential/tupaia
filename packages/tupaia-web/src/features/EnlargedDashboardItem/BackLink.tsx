import React, { ComponentType } from 'react';
import styled from 'styled-components';
import { useLocation, useSearchParams, Link, To } from 'react-router-dom';
import { IconButtonProps } from '@material-ui/core';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { IconButton } from '@tupaia/ui-components';
import { DashboardItem } from '../../types';
import { URL_SEARCH_PARAMS } from '../../constants';

const BackLinkButton = styled(IconButton).attrs({
  component: Link,
  color: 'default',
})`
  position: absolute;
  left: 0;
  top: -0.2rem;
  padding: 0.5rem;
  svg {
    width: 2rem;
    height: 2rem;
  }
` as ComponentType<IconButtonProps & { to: To }>; // need to add the to prop to the type for the icon button

export const BackLink = ({
  parentDashboardItem,
}: {
  parentDashboardItem?: DashboardItem | null;
}) => {
  const [urlSearchParams] = useSearchParams();
  const location = useLocation();
  if (!parentDashboardItem) return null;
  const { code } = parentDashboardItem;
  // we make a copy of the search params so we don't mutate the original and accidentally change the url
  const searchParams = new URLSearchParams(urlSearchParams);
  searchParams.set(URL_SEARCH_PARAMS.REPORT, code);
  searchParams.delete(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);
  const backLink = {
    ...location,
    search: searchParams.toString(),
  };

  return (
    <BackLinkButton to={backLink} title="Back to parent dashboard item">
      <KeyboardArrowLeft />
    </BackLinkButton>
  );
};
