import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SurveyResponseFeedItem } from '../../../types';
import { useIsMobile, displayDate } from '../../../utils';

const DesktopContainer = styled.div`
  display: flex;
  flex: 1;
  margin-right: 1rem;

  .MuiTypography-colorTextSecondary {
    margin-bottom: 0.62rem;
  }
`;

const Content = styled(Typography)`
  ${({ theme }) => theme.breakpoints.down('md')} {
    margin-top: 0.5rem;
  }
`;

const Image = styled.img.attrs({
  src: '/tupaia-high-five.svg',
  alt: 'Illustration of two hands giving a high five',
})`
  max-height: 100%;
  max-width: 100%;
  height: 3.4rem;
  width: 3.4rem;
  margin-right: 1rem;

  ${({ theme }) => theme.breakpoints.down('md')} {
    height: 3rem;
    width: 3rem;
  }
`;

const getLocationName = (templateVariables: SurveyResponseFeedItem['templateVariables']) => {
  if (templateVariables.regionName)
    return `${templateVariables.regionName}, ${templateVariables.countryName}`;

  return templateVariables.countryName;
};

const DesktopTemplate = ({ templateVariables, formattedDate }) => {
  const { surveyName, authorName, countryName } = templateVariables;
  return (
    <>
      <DesktopContainer>
        <Image aria-hidden />
        {/** set aria-hidden on the image because the image isn't of any informational value */}
        <div>
          <Typography>{authorName}</Typography>
          <Typography color="textSecondary">
            {formattedDate} | {countryName}
          </Typography>
          <Content>
            Completed <b>{surveyName}</b> survey for <b>{getLocationName(templateVariables)}</b>
          </Content>
        </div>
      </DesktopContainer>
    </>
  );
};

const MobileContainer = styled.div`
  display: flex;
  flex: 1;
  margin-right: 1rem;

  .MuiTypography-colorTextSecondary {
    margin-bottom: 0.62rem;
  }
`;

const MobileTemplate = ({ templateVariables, formattedDate }) => {
  const { surveyName, authorName, countryName } = templateVariables;

  return (
    <>
      <MobileContainer>
        <Image aria-hidden />
        {/** set aria-hidden on the image because the image isn't of any informational value */}
        <div>
          <Typography>{authorName}</Typography>
          <Typography color="textSecondary">
            {formattedDate} | {countryName}
          </Typography>
        </div>
      </MobileContainer>
      <Content>
        Completed <b>{surveyName}</b> survey for <b>{getLocationName(templateVariables)}</b>
      </Content>
    </>
  );
};

export const ActivityFeedSurveyItem = ({ feedItem }: { feedItem: SurveyResponseFeedItem }) => {
  const { templateVariables, creationDate } = feedItem;
  const formattedDate = displayDate(creationDate as Date);
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileTemplate templateVariables={templateVariables} formattedDate={formattedDate} />;
  }

  return <DesktopTemplate templateVariables={templateVariables} formattedDate={formattedDate} />;
};
