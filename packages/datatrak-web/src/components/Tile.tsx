/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { Typography, Box, Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { Button } from './Button';
import { DESKTOP_MEDIA_QUERY } from '../constants';

const Wrapper = styled(Paper).attrs({
  elevation: 0,
})`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 0.8rem 1rem;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.625rem;
  font-weight: 400;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  overflow: hidden;
`;

const ButtonWrapper = styled(Wrapper).attrs({
  component: Button,
})`
  flex-direction: row;
  position: relative;
  justify-content: flex-start;
  align-items: flex-start;
  padding-block-start: 0.8rem;
  padding-block-end: 0;
  padding-inline: 0;

  svg {
    margin-right: 0.4rem;
    margin-top: 0.2rem;
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.primaryHover};
  }
  ${DESKTOP_MEDIA_QUERY} {
    padding-inline: 1rem;
    padding-block: 0.8rem;
  }
` as typeof Button;

const Text = styled(Typography)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-inline: 0.8rem;
  &:not(:last-child) {
    margin-bottom: 0.2rem;
  }
  ${DESKTOP_MEDIA_QUERY} {
    padding-inline: 0;
  }
`;

const Heading = styled(Text)`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 0.2rem;
`;

const LoadingContainer = styled.div`
  overflow: hidden;
  max-height: 100%;
  > div {
    &:not(:last-child) {
      margin-bottom: 0.6rem;
    }
  }
`;

const ButtonContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${DESKTOP_MEDIA_QUERY} {
    flex-direction: row;
  }
`;

const TextWrapper = styled(Box)`
  margin-block-start: 0.2rem;
  width: 100%;
  ${DESKTOP_MEDIA_QUERY} {
    margin-block-start: 0;
  }
`;

const ContentItem = styled.div`
  width: 100%;
  padding-inline: 1rem;

  ${DESKTOP_MEDIA_QUERY} {
    width: auto;
    padding-inline: 0;
  }
`;

interface TileProps {
  title?: string;
  text?: string;
  to?: string;
  tooltip?: ReactNode;
  children?: ReactNode;
  Icon?: ComponentType;
  onClick?: () => void;
}

export const Tile = ({ title, text, children, to, tooltip, Icon, onClick }: TileProps) => {
  const content = [text, children].filter(Boolean);
  return (
    <ButtonWrapper to={to} tooltip={tooltip} onClick={onClick}>
      <ButtonContent>
        {Icon && (
          <ContentItem>
            <Icon />
          </ContentItem>
        )}
        <TextWrapper maxWidth="100%">
          {title && <Heading>{title}</Heading>}
          {content.map((content, index) => (
            <Text key={index}>{content}</Text>
          ))}
        </TextWrapper>
      </ButtonContent>
    </ButtonWrapper>
  );
};

export const LoadingTile = ({ count = 1 }) => {
  return (
    <LoadingContainer>
      {Array.from({ length: count }).map((_, index) => (
        <Wrapper key={index}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="40%" />
        </Wrapper>
      ))}
    </LoadingContainer>
  );
};
