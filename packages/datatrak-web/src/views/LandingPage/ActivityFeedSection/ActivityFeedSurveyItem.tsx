/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ListItemProps, ListItem as MuiListItem, Typography } from '@material-ui/core';
import { SurveyResponseFeedItem } from '../../../types';

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

const ListItemImageContainer = styled.div`
  height: 4rem;
  width: 4rem;
`;

const Image = styled.img.attrs({
  src: '/survey-activity.svg',
})`
  height: 100%;
  width: 100%;
`;

export const ActivityFeedSurveyItem = ({ feedItem }: { feedItem: SurveyResponseFeedItem }) => {
  const { templateVariables, creationDate } = feedItem;
  const formattedDate = creationDate ? format(new Date(creationDate! as Date), 'P') : '';

  const getLocationName = () => {
    if (templateVariables?.regionName)
      return `${templateVariables.regionName}, ${templateVariables.countryName}`;

    return templateVariables?.countryName;
  };

  const locationName = getLocationName();
  return (
    <ListItem>
      <ListItemImageContainer>
        {/** set aria-hidden on the image because the image isn't of any informational value */}
        <Image aria-hidden />
      </ListItemImageContainer>
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
