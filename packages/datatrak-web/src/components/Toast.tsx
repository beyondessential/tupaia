import { IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { CustomContentProps, OptionsObject, SnackbarContent, closeSnackbar } from 'notistack';
import React from 'react';
import styled from 'styled-components';

import { VisuallyHidden } from '@tupaia/ui-components';

const nonAttributes = new Set([
  'action',
  'anchorOrigin',
  'autoHideDuration',
  'hideIconVariant',
  'iconVariant',
  'persist',
]);

const Wrapper = styled(SnackbarContent).withConfig({
  shouldForwardProp: prop => !nonAttributes.has(prop),
})`
  background-color: white;
  border-radius: 0.625rem;
`;

const Container = styled.div<{
  $variant: CustomContentProps['variant'];
}>`
  align-items: center;
  background-color: ${({ theme, $variant }) => theme.palette[$variant].light};
  border-radius: 0.625rem;
  display: flex;
  padding-block: 0.5rem;
  padding-inline: 0.88rem 0.58rem;
  inline-size: 100%;
`;

const IconWrapper = styled.div`
  margin-right: 0.44rem;
  width: 1.1rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 100%;
  }
`;

const CloseButton = styled(IconButton)<{
  $variant: CustomContentProps['variant'];
}>`
  color: ${({ theme, $variant }) => {
    if ($variant === 'error') return theme.palette.error.main;
  }};
  padding: 0.2rem;
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

const Message = styled(Typography)<{
  $variant: CustomContentProps['variant'];
}>`
  font-size: 0.875rem;
  flex: 1;
  word-break: break-word;
  text-align: ${({ $variant }) => ($variant === 'info' ? 'center' : 'start')};
  color: ${({ theme, $variant }) => {
    if ($variant === 'error') {
      return theme.palette.error.main;
    }
    if ($variant === 'info') {
      return theme.palette.info.main;
    }
    return theme.palette.text.primary;
  }};
`;

interface ToastProps extends CustomContentProps {
  Icon?: OptionsObject['Icon'];
  hideCloseButton?: boolean;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  const { id, Icon, message, variant, hideCloseButton = false, ...notistackProps } = props;

  return (
    <Wrapper ref={ref} role="alert" {...notistackProps}>
      <Container $variant={variant}>
        {Icon && (
          <IconWrapper>
            <Icon />
          </IconWrapper>
        )}
        <Message $variant={variant}>{message}</Message>
        {!hideCloseButton && (
          <CloseButton $variant={variant} onClick={() => closeSnackbar(id)}>
            <Close />
            <VisuallyHidden>Dismiss</VisuallyHidden>
          </CloseButton>
        )}
      </Container>
    </Wrapper>
  );
});
