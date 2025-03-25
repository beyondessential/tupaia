import styled, { css } from 'styled-components';

/*
 * The px values below are not actually equivalent to the mm values above when interpreted as CSS
 * units, because CSS takes 1px to be 1/96 of an inch. The intention is to refactor PDF exports to
 * use absolute length units (like cm and pt) and remove these constants at some point.
 */
export const A4_PAGE_WIDTH_PX = 793.701;

export const A4Page = styled.div<{
  $separatePage?: boolean;
}>`
  ${props =>
    props.$separatePage &&
    css`
      break-before: page;
      @supports not (break-before: page) {
        page-break-before: always;
      }
    `};

  background: none;
  break-inside: avoid;
  flex-direction: column;
  padding-left: 25mm;
  padding-right: 25mm;
  width: 210mm;
`;
