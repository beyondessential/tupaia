import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiAlert from '@material-ui/lab/Alert';
import { UserMessage, UserMessageFooter, UserMessageHeader } from '../src/components';
import { FakeAPI } from './story-utils/api';

export default {
  title: 'UserMessage',
};

const Container = styled.div`
  padding: 1rem;
  max-width: 490px;
`;

const StyledAlert = styled(MuiAlert)`
  margin: 1rem;
`;

const exampleUser = {
  profileImage: 'https://www.gravatar.com/avatar/03d39b671d0f4fd5b3dcb28bf4676760',
  name: 'Dr. Sarah De Jones',
};

const message = {
  content: null,
  id: 'user-message-123',
  created: new Date(),
  lastEdited: new Date(),
};

const api = new FakeAPI();

export const userMessage = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  const handleUpdate = async id => {
    await api.post();
    setAlertMessage(`Updating ${id}...`);
  };
  const handleDelete = async id => {
    await api.post();
    setAlertMessage(`Deleting ${id}...`);
  };

  return (
    <Container>
      {alertMessage && <StyledAlert severity="info">{alertMessage}</StyledAlert>}
      <UserMessage
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        Header={<UserMessageHeader user={exampleUser} dateTime={message.created} />}
        message={message}
      />
    </Container>
  );
};

const UserMessageBanner = styled.div`
  font-size: 0.6875rem;
  line-height: 0.8rem;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  color: white;
  padding: 0.7rem;
  background: ${props => props.theme.palette.error.main};
`;

const CustomHeader = ({ user, dateTime, ActionsMenu }) => (
  <>
    <UserMessageHeader user={user} dateTime={dateTime} ActionsMenu={ActionsMenu} />
    <UserMessageBanner>Outbreak confirmed</UserMessageBanner>
  </>
);

CustomHeader.propTypes = {
  user: PropTypes.object.isRequired,
  dateTime: PropTypes.instanceOf(Date).isRequired,
  ActionsMenu: PropTypes.any,
};

CustomHeader.defaultProps = {
  ActionsMenu: null,
};

export const customUserMessage = () => {
  const [alertMessage, setAlertMessage] = React.useState(null);

  const handleUpdate = id => setAlertMessage(`Updating ${id}...`);
  const handleDelete = id => setAlertMessage(`Deleting ${id}...`);

  return (
    <Container>
      {alertMessage && <StyledAlert severity="info">{alertMessage}</StyledAlert>}
      <UserMessage
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        Header={<CustomHeader user={exampleUser} dateTime={message.created} />}
        Footer={<UserMessageFooter user={exampleUser} dateTime={message.lastEdited} />}
        message={message}
      />
    </Container>
  );
};
