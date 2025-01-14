import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';

export const FlexSpaceBetween = styled(MuiBox)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexStart = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

export const FlexCenter = styled(MuiBox)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FlexEnd = styled(MuiBox)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const FlexColumn = styled(MuiBox)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
