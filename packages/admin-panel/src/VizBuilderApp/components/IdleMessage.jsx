import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PlayIcon from '@material-ui/icons/PlayCircleFilled';
import { FlexColumn } from '@tupaia/ui-components';

const Container = styled(FlexColumn)`
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: 0 auto;
`;

const Icon = styled(PlayIcon)`
  color: ${props => props.theme.palette.text.secondary};
  font-size: 60px;
  margin-bottom: 0.5rem;
`;

const Text = styled(Typography)`
  font-size: 21px;
  font-weight: 600;
  color: ${props => props.theme.palette.text.secondary};
  margin-bottom: 0.3rem;
`;

export const IdleMessage = () => {
  return (
    <Container>
      <Icon />
      <Text variant="h3">Press play to preview data</Text>
    </Container>
  );
};
