import styled from 'styled-components';
import { FlexColumn } from './Layout/Flexbox';

export const A4_PAGE_WIDTH_PX = 1192;

export const A4Page = styled.div`
  width: ${A4_PAGE_WIDTH_PX}px;
  page-break-after: always;
`;

export const A4PageContent = styled(FlexColumn)`
  margin: 0px 70px;
`;
