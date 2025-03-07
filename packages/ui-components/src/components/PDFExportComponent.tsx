import styled from 'styled-components';

/*
 * The px values below are not actually equivalent to the mm values above when interpreted as CSS
 * units, because CSS takes 1px to be 1/96 of an inch. The intention is to refactor PDF exports to
 * use absolute length units (like cm and pt) and remove these constants at some point.
 */
export const A4_PAGE_WIDTH_PX = 1191; // at 144ppi
export const A4_PAGE_HEIGHT_PX = 1683; // at 144ppi

export const A4Page = styled.div<{
  separatePage?: boolean;
}>`
  width: 210mm;
  height: 297mm;
  break-after: ${({ separatePage }) => (separatePage ? 'always' : 'auto')};
  break-inside: avoid;
  flex-direction: column;
  padding-block: 1.5cm 4.5cm 2cm; // Bottom slightly taller than top for *optical* alignment
`;
