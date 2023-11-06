/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { ListItemProps, ListItem as MuiListItem, Typography } from '@material-ui/core';
import { FeedItem } from '../../../types';
import { format } from 'date-fns';

const ListItem = styled(MuiListItem)<ListItemProps>`
  padding: 1.2rem 0.6rem 1.2rem 0;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 1rem;
  p {
    font-size: 0.75rem;
  }
`;

const DateText = styled(Typography).attrs({
  color: 'textSecondary',
})`
  font-size: 0.625rem;
  margin-bottom: 1.3rem;
`;

const Image = styled.img`
  height: 4rem;
`;

export const ActivityFeedSurveyItem = ({ feedItem }: { feedItem: FeedItem }) => {
  const { template_variables: templateVariables, creation_date: creationDate } = feedItem;
  const formattedDate = format(new Date(creationDate!), 'dd/MM/yyyy');

  const getLocationName = () => {
    if (templateVariables?.regionName)
      return `${templateVariables.regionName}, ${templateVariables.countryName}`;

    return templateVariables?.countryName;
  };

  const locationName = getLocationName();
  return (
    <ListItem>
      {/** set aria-hidden on the image because the image isn't of any informational value */}
      <Image src="/survey-activity.svg" aria-hidden />
      <Container>
        <Typography>{templateVariables?.authorName}</Typography>
        <DateText>{formattedDate}</DateText>
        <Typography>
          Completed <b>{templateVariables?.surveyName}</b> survey for <b>{locationName}</b>
        </Typography>
      </Container>
    </ListItem>
  );
};
