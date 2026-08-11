import styled from 'styled-components';

export const Image = styled.img.attrs({
  crossOrigin: '',
  height: 200,
})`
  height: 200px;
  object-fit: cover;
  object-position: center;
  width: 100%;
`;
