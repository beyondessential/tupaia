import { Property } from 'csstype';
import styled, { css } from 'styled-components';

/**
 * A scrollable <FlexColumn>, intended to be used with a fixed block size. Its children default to
 * filling the available inline space.
 *
 * Consider also setting as="ul" and role="list". These sorts of scroll views often should have set
 * semantics.
 */
export const BlockScrollView = styled.div<{
  $gap?: Property.RowGap;
  $size?: Property.BlockSize;
}>`
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

/**
 * A scrollable <FlexRow>, intended to be used with a fixed block size. Its children default to
 * filling the available block space.
 *
 * Consider also setting as="ul" and role="list". These sorts of scroll views often should have set
 * semantics.
 */
export const InlineScrollView = styled.div<{
  $gap?: Property.ColumnGap;
  $size?: Property.InlineSize;
}>`
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
