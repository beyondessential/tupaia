import React from 'react';
import { SnackbarContent, CustomContentProps, closeSnackbar, OptionsObject } from 'notistack';
import styled from 'styled-components';
import { IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';

const Wrapper = styled(SnackbarContent)`
  background-color: white;
  border-radius: 0.625rem;
`;

const Container = styled.div<{
  $variant: CustomContentProps['variant'];
}>`
  background-color: ${({ theme, $variant }) => theme.palette[$variant].light};
  border-radius: 0.625rem;
  display: flex;
  width: 100%;
  align-items: center;
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
          <CloseButton
            onClick={() => closeSnackbar(id)}
            $variant={variant}
            title="Close toast message"
          >
            <Close />
          </CloseButton>
        )}
      </Container>
    </Wrapper>
  );
});
