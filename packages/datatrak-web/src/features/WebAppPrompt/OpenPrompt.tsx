import React from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Button, SafeAreaColumn } from '@tupaia/ui-components';

const Wrapper = styled(SafeAreaColumn)`
  align-items: center;
  background-color: oklch(32% 0 0);
  color-scheme: dark only;
  color: white;
  display: flex;
  flex: initial;
  font-size: 0.875rem;
  line-height: 1.5;
  padding-bottom: 0.75rem;
  padding-top: calc(env(safe-area-inset-top, 0) + 0.75rem);
  text-wrap: pretty;
  gap: 1rem;
`;

const SecondaryText = styled(Typography).attrs({ color: 'textSecondary' })`
  margin-block-start: 0.25em;
`;

const Logo = styled.img.attrs({
  'aria-hidden': true,
  src: '/datatrak-logo-white.svg',
})`
  height: auto;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  width: 4rem;
`;

const OpenButton = styled(Button)`
  border-radius: calc(infinity * 1px);
  padding-block: 0.25rem;

  .MuiButton-label {
    text-box-edge: cap alphabetic;
    text-box-trim: trim-both;
  }
`;

export const OpenPrompt = (props: React.ComponentPropsWithoutRef<typeof Wrapper>) => {
  return (
    <Wrapper {...props}>
      <Logo />
      <div style={{ flex: 1 }}>
        <Typography>Tupaia DataTrak is best used with the web app on mobile</Typography>
        <SecondaryText>Open in the Tupaia DataTrak web app</SecondaryText>
      </div>
      <OpenButton>Open</OpenButton>
    </Wrapper>
  );
};
