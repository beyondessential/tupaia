/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import styled from 'styled-components';

export const TooltipContainer = styled.div`
  background: ${({ theme }) =>
    theme.palette.type === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  border-radius: 3px;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  padding: 1rem;
`;
