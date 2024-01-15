import styled from 'styled-components';

export const A4_PAGE_WIDTH_PX = 1192;

export const A4Page = styled.div`
  padding: 0px 70px;
  page-break-after: always;
  width: ${A4_PAGE_WIDTH_PX}px;
`;
