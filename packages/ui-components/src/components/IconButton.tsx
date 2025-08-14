import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { OverrideableComponentProps } from '../types';

// export as a styled component so that we can forward refs without any other configuration
export const IconButton = styled(MuiIconButton).attrs(
  (props: OverrideableComponentProps<IconButtonProps>) => ({
    color: 'primary',
    ...props,
  }),
)``;

export const LightIconButton = styled(IconButton)`
  color: white;
`;
