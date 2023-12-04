/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import Markdown from 'markdown-to-jsx';
import { MarkdownFeedItem } from '../../../types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Heading = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 0.4rem;
`;

const Image = styled.img`
  max-height: 10rem;
  border-radius: 0.625rem;
  max-width: 100%;
`;

const Header = styled.div`
  margin-bottom: 0.6rem;
  display: flex;
`;

const Logo = styled.img.attrs({
  src: '/bes-logo.svg',
  alt: 'BES logo',
})`
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.5rem;
`;

export const ActivityFeedMarkdownItem = ({ feedItem }: { feedItem: MarkdownFeedItem }) => {
  const { templateVariables, creationDate } = feedItem;
  const formattedDate = creationDate ? new Date(creationDate as Date).toLocaleDateString() : '';
  return (
    <Wrapper>
      <Header>
        <Logo />
        <div>
          <Typography>BES</Typography>
          <Typography color="textSecondary">{formattedDate}</Typography>
        </div>
      </Header>
      <Heading>{templateVariables?.title}</Heading>
      {templateVariables?.body && <Markdown>{templateVariables?.body}</Markdown>}
      {templateVariables?.image && (
        <Image
          src={templateVariables?.image}
          alt={`Image for feed item ${templateVariables?.title}`}
        />
      )}
    </Wrapper>
  );
};
