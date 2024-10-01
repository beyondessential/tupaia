import styled from 'styled-components';
import { DESKTOP_MEDIA_QUERY } from '../../constants';

export const ResponsiveScrollBody = styled.div`
  display: grid;
  overflow: auto;
  grid-template-columns: repeat(auto-fill, 18rem);
  grid-column-gap: 1rem;
  grid-row-gap: 0.6rem;
  grid-template-rows: 1fr;
  grid-auto-flow: column;
  > * {
    width: 18rem;
  }

  ${DESKTOP_MEDIA_QUERY} {
    grid-auto-flow: row;
    > span {
      width: 100%;
    }
  }
`;
