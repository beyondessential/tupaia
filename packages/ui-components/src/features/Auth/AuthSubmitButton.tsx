import styled from 'styled-components';
import { Button } from '../../components';

export const AuthSubmitButton = styled(Button)`
  text-transform: none;
  font-size: 1rem;
  width: 22rem;
  max-width: 100%;
  margin-left: 0 !important;
  margin-top: 2rem;
  & + & {
    margin-top: 1rem;
  }
`;
