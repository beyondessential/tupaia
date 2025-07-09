import styled from 'styled-components';

export const OrDivider = styled.p.attrs({ children: 'or' })`
  align-items: center;
  column-gap: 1em;
  display: grid;
  font-size: inherit;
  font-weight: 500;
  grid-template-columns: minmax(0, 1fr) min-content minmax(0, 1fr);
  inline-size: 100%;
  margin-block-start: 1em;
  text-box-edge: ex alphabetic; // Specific to the word “or”, which has no ascenders

  &::before,
  &::after {
    block-size: 0;
    border-block-end: max(0.0625rem, 1px) solid currentColor;
    content: '';
  }
`;
