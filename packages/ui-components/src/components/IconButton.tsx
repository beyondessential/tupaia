/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import MuiIconButton from '@material-ui/core/IconButton';

// export as a styled component so that we can forward refs without any other configuration
export const IconButton = styled(MuiIconButton).attrs({
  color: 'primary',
})``;

export const LightIconButton = styled(IconButton)`
  color: white;
`;
