import { Property } from 'csstype';
import styled, { css } from 'styled-components';

export const BlockCarousel = styled.div<{ $gap?: Property.RowGap }>`
  align-items: stretch;
  display: flex;
  flex-direction: column;

  ${({ $gap }) =>
    $gap &&
    css`
      row-gap: ${$gap};
    `}

  overflow-block: auto;
  @supports not (overflow-inline: auto) {
    overflow-y: auto;
  }
`;

export const InlineCarousel = styled.div<{ $gap?: Property.ColumnGap }>`
  align-items: stretch;
  display: flex;
  flex-direction: row;

  ${({ $gap }) =>
    $gap &&
    css`
      column-gap: ${$gap};
    `}

  overflow-inline: auto;
  @supports not (overflow-inline: auto) {
    overflow-x: auto;
  }
`;
