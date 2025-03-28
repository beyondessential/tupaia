import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { SvgIcon, Typography } from '@material-ui/core';
import { TITLE_BAR_HEIGHT } from '../constants';

const Wrapper = styled.div<{
  $isTransparent?: boolean;
}>`
  --border-width: max(0.0625rem, 1px);
  block-size: ${TITLE_BAR_HEIGHT};
  background-color: ${({ theme, $isTransparent }) =>
    $isTransparent ? 'transparent' : theme.palette.background.paper};
  border-block-start: var(--border-width) solid ${({ theme }) => theme.palette.divider};
  // Make sure this is always visible, even with QR code panel open
  margin-block-start: calc(var(--border-width) * -1);
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-inline: -1.25rem;
    margin-inline: -1.25rem;
  }
`;

const TitleWrapper = styled.div`
  padding: 0.8rem;
  display: flex;
  align-items: center;
  flex: 1;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.3rem;
  }
  .MuiSvgIcon-root {
    margin-right: 0.5rem;
  }
`;

interface PageTitleBarProps {
  title?: ReactNode;
  children?: ReactNode;
  isTransparent?: boolean;
  Icon: typeof SvgIcon;
}

export const PageTitleBar = ({ isTransparent, title, children, Icon }: PageTitleBarProps) => {
  return (
    <Wrapper $isTransparent={isTransparent}>
      <TitleWrapper>
        <Icon color="primary" />
        {title && <Typography variant="h1">{title}</Typography>}
      </TitleWrapper>
      {children}
    </Wrapper>
  );
};
