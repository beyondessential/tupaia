import styled from 'styled-components';

export const Media = styled.div<{
  $backgroundImage?: string;
}>`
  position: relative;
  min-height: 12.5rem;
  width: 100%;
  padding-bottom: 25%;
  background-image: ${({ $backgroundImage }) => `url("${$backgroundImage}")`};
  background-size: cover;
  background-position: center;
`;
