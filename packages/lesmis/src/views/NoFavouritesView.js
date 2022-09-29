import React from 'react';
import styled from 'styled-components';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import { FlexCenter, FlexColumn, SmallAlert } from '@tupaia/ui-components';
import { useUser } from '../api';
import { SignUpLink, LoginLink } from '../components';

const InfoAlert = styled(SmallAlert)`
  margin: 2rem auto;
`;

const Message = styled(FlexCenter)`
  margin-top: 5vh;
  margin-bottom: 3vh;
  font-weight: 500;
`;

const LoginButtonWrapper = styled.div`
  background-color: ${props => props.theme.palette.primary.main};
  border-radius: 2.5rem;
  .login-link {
    padding: 0.3rem 1rem;
  }
`;

const SignUpButtonWrapper = styled(LoginButtonWrapper)`
  background-color: white;
`;

const NoFavouritesView = () => {
  const { isLoggedIn } = useUser();
  if (isLoggedIn) {
    return (
      <InfoAlert severity="info" variant="standard">
        <FlexCenter>
          Click <FavoriteBorderIcon /> next to a dashboard to save it here in your favourites.
        </FlexCenter>
      </InfoAlert>
    );
  }

  return (
    <FlexColumn>
      <Message>
        Sign up or log into your account to save and view your favourite dashboards.
      </Message>
      <FlexCenter>
        <SignUpButtonWrapper>
          <SignUpLink isRound />
        </SignUpButtonWrapper>
        <LoginButtonWrapper>
          <LoginLink />
        </LoginButtonWrapper>
      </FlexCenter>
    </FlexColumn>
  );
};

export default NoFavouritesView;
