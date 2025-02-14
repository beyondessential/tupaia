import styled from 'styled-components';

export const TooltipContainer = styled.div`
  background: white;
  border-radius: 3px;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  padding: 1rem;
`;
