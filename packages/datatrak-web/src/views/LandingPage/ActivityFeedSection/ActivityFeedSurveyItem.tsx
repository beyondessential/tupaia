/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyResponseFeedItem } from '../../../types';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-left: 1rem;
  .MuiTypography-colorTextSecondary {
    margin-bottom: 1.3rem;
  }
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
  const formattedDate = creationDate ? new Date(creationDate as Date).toLocaleDateString() : '';

  const getLocationName = () => {
    if (templateVariables?.regionName)
      return `${templateVariables.regionName}, ${templateVariables.countryName}`;

    return templateVariables?.countryName;
  };

  const locationName = getLocationName();
  return (
    <>
      <ListItemImageContainer>
        {/** set aria-hidden on the image because the image isn't of any informational value */}
        <Image aria-hidden />
      </ListItemImageContainer>
      <Container>
        <Typography>{templateVariables?.authorName}</Typography>
        <Typography color="textSecondary">{formattedDate}</Typography>
        <Typography>
          Completed <b>{templateVariables?.surveyName}</b> survey for <b>{locationName}</b>
        </Typography>
      </Container>
    </>
  );
};
