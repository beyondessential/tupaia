import { ButtonProps, Paper, Typography } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, { Fragment, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { useIsMobile } from '../utils';
import { Button } from './Button';

const Wrapper = styled(Paper).attrs({
  elevation: 0,
  component: Button,
})`
  align-items: stretch;
  border-radius: 0.625rem;
  display: block flex;
  flex-direction: column;
  font-size: 0.875rem;
  font-weight: 400;
  gap: 0.25rem 0.5rem;
  inline-size: 14.75rem;
  justify-content: flex-start;
  line-height: 1.45;
  min-block-size: fit-content;
  overflow: hidden;
  padding: 1rem;

  .MuiButton-label :where(p, h1, h2, h3, h4, h5, h6) {
    margin-block: 0;
  }

  ${({ theme }) => css`
    color: ${theme.palette.text.secondary};

    &,
    &.Mui-disabled.MuiButton-containedPrimary {
      background-color: ${theme.palette.background.paper};
      opacity: initial;
    }

    &:hover {
      background-color: ${theme.palette.primaryHover};
    }

    ${theme.breakpoints.up('md')} {
      flex-direction: row;
      inline-size: 100%;
    }
  `}

  .MuiButton-label {
    display: contents;
  }
` as typeof Button;

const Header = styled.header`
  align-items: start;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;

  ${({ theme }) => {
    const { down, up } = theme.breakpoints;
    return css`
      ${down('md')} {
        margin-block-end: 0.5rem;
        block-size: 1.5rem;
      }
      ${up('md')} {
        flex-direction: column;
      }
    `;
  }}
`;

const IconGroup = styled.div`
  block-size: 100%;
  display: flex;
  gap: 0.25rem;
`;
const LeadingIconGroup = styled(IconGroup)`
  align-self: flex-start;
`;
const TrailingIconGroup = styled(IconGroup)`
  align-self: flex-end;
`;

const BodyWrapper = styled.div`
  min-inline-size: 0;
  flex: 1;
`;

const Heading = styled(Typography).attrs({ variant: 'h3' })`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 1rem;
  font-weight: 500;
  line-height: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export interface TileProps extends ButtonProps {
  heading?: ReactNode;
  description?: ReactNode;
  leadingIcons?: ReactNode;
  trailingIcons?: ReactNode;
  to?: string;
  tooltip?: ReactNode;
}

export const Tile = ({
  children,
  description,
  heading,
  leadingIcons,
  trailingIcons,
  ...props
}: TileProps) => {
  const Body = useIsMobile() ? Fragment : BodyWrapper;
  return (
    <Wrapper {...props}>
      <Header>
        {leadingIcons && <LeadingIconGroup>{leadingIcons}</LeadingIconGroup>}
        {trailingIcons && <TrailingIconGroup>{trailingIcons}</TrailingIconGroup>}
      </Header>
      <Body>
        {heading && <Heading>{heading}</Heading>}
        {children}
      </Body>
    </Wrapper>
  );
};

interface TileSkeletonProps {
  lineCount?: number;
}
export const TileSkeleton = ({ lineCount = 2 }: TileSkeletonProps) => (
  <Tile
    disabled
    leadingIcons={<Skeleton variant="circle" width={24} height={24} />}
    heading={<Skeleton width="100%" />}
  >
    {Array.from({ length: lineCount }).map((_, i) => (
      <Skeleton key={i} width="60%" />
    ))}
  </Tile>
);

export const TileSkeletons = ({
  count = 3,
  tileSkeletonProps,
}: {
  count?: number;
  tileSkeletonProps?: TileSkeletonProps;
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <TileSkeleton key={i} {...tileSkeletonProps} />
    ))}
  </>
);
