import styled from 'styled-components';
import { FlexColumn } from './Layout/Flexbox';

export const A4Page = styled.div`
  width: 1192px;
  page-break-after: always;
`;

export const A4PageContent = styled(FlexColumn)`
  margin: 0px 70px;
`;
