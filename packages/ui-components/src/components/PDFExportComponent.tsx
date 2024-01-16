import styled from 'styled-components';

export const A4_PAGE_WIDTH_MM = 210;
export const A4_PAGE_HEIGHT_MM = 297;

/*
 * The px values below are not actually equivalent to the mm values above when interpreted as CSS
 * units, because CSS takes 1px to be 1/96 of an inch. The intention is to refactor PDF exports to
 * use absolute length units (like cm and pt) and remove these constants at some point.
 */
export const A4_PAGE_WIDTH_PX = 1191; // at 144ppi
export const A4_PAGE_HEIGHT_PX = 1684; // at 144ppi

export const A4Page = styled.div`
  width: ${A4_PAGE_WIDTH_PX}px;
  height: ${A4_PAGE_HEIGHT_MM}px;

  break-after: page;
  padding: 4cm 4.5cm 4.5cm; // Bottom slightly taller than top for *optical* alignment
`;
