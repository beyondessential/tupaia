import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { SvgIcon, Typography } from '@material-ui/core';
import { TITLE_BAR_HEIGHT } from '../constants';

const Wrapper = styled.div<{
  $isTransparent?: boolean;
}>`
  height: ${TITLE_BAR_HEIGHT};
  background: ${({ theme, $isTransparent }) =>
    $isTransparent ? 'transparent' : theme.palette.background.paper};
  border-top: 1px solid ${({ theme }) => theme.palette.divider};
  margin-top: -1px; // make sure this is always visible, even with qr code panel open
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.up('md')} {
    margin-left: -1.25rem;
    margin-right: -1.25rem;
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
