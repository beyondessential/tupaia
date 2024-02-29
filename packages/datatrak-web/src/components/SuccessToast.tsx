/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ComponentType } from 'react';
import { CustomContentProps } from 'notistack';
import styled from 'styled-components';
import { Toast } from '@tupaia/ui-components';

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

interface ToastProps extends CustomContentProps {
  Icon?: ComponentType;
}

export const SuccessToast = React.forwardRef<HTMLDivElement, ToastProps>((props, ref) => {
  const { Icon, ...toastProps } = props;

  return (
    <Toast {...toastProps} ref={ref}>
      {Icon && (
        <IconWrapper>
          <Icon />
        </IconWrapper>
      )}
    </Toast>
  );
});
