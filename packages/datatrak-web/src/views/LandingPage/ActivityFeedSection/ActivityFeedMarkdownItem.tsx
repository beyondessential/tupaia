import { Typography } from '@material-ui/core';
import Markdown from 'markdown-to-jsx';
import React from 'react';
import styled from 'styled-components';

import { MarkdownFeedItem } from '../../../types';
import { displayDate } from '../../../utils';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  > * {
    font-size: 0.75rem;
  }
`;

const Heading = styled(Typography)`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  margin-bottom: 0.4rem;
`;

const Image = styled.img.attrs({ crossOrigin: '' })`
  height: 10rem;
  width: auto;
  max-width: 100%;
  border-radius: 0.625rem;
  max-width: 100%;
  margin-top: 0.75rem;
`;

const Header = styled.div<{
  $isPinned?: boolean;
}>`
  margin-bottom: 0.6rem;
  display: flex;
  padding-inline-start: ${({ $isPinned }) => ($isPinned ? '1rem' : '0')};
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding-inline-start: 0;
  }
`;

const Logo = styled.img.attrs({
  'aria-hidden': true,
  src: '/bes-logo.svg',
})`
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.5rem;
`;

export const ActivityFeedMarkdownItem = ({
  feedItem,
  isPinned,
}: {
  feedItem: MarkdownFeedItem;
  isPinned?: boolean;
}) => {
  const { templateVariables, creationDate } = feedItem;
  const formattedDate = displayDate(creationDate as Date);
  return (
    <Wrapper>
      <Header $isPinned={isPinned}>
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
