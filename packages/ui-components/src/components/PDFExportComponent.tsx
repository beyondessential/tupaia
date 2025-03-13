import styled from 'styled-components';

/*
 * The px values below are not actually equivalent to the mm values above when interpreted as CSS
 * units, because CSS takes 1px to be 1/96 of an inch. The intention is to refactor PDF exports to
 * use absolute length units (like cm and pt) and remove these constants at some point.
 */
export const A4_PAGE_WIDTH_PX = 1191; // at 144ppi

export const A4Page = styled.div<{
  separatePage?: boolean;
}>`
  background: none;
  break-after: ${({ separatePage }) => (separatePage ? 'always' : 'auto')};
  break-inside: avoid;
  flex-direction: column;
  padding-left: 25mm;
  padding-right: 25mm;
  width: 210mm;
`;
