import styled from 'styled-components';

export const ResponsiveScrollBody = styled.div`
  display: grid;
  overflow: auto;
  grid-template-columns: repeat(auto-fill, 18rem);
  grid-column-gap: 1rem;
  grid-row-gap: 0.6rem;
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  .MuiButtonBase-root {
    width: 18rem;
    max-width: 100%;
  }
`;
