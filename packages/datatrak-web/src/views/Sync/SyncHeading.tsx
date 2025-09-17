import { Typography } from '@material-ui/core';
import { Variant } from '@material-ui/core/styles/createTypography';
import styled from 'styled-components';

export const SyncHeading = styled(Typography).attrs((props: { variant?: Variant }) => ({
  variant: props.variant,
}))`
  font-size: inherit;
  letter-spacing: initial;
`;
