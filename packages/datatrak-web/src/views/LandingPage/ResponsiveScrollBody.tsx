import styled from 'styled-components';

export const ResponsiveScrollBody = styled.div`
  display: grid;
  overflow-x: auto;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 18rem));
  grid-column-gap: 1rem;
  grid-row-gap: 0.6rem;
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  > span {
    width: 18rem;
    max-width: 100%;
  }
`;
