import React from 'react';
import PropTypes from 'prop-types';
import { Dialog } from '@material-ui/core';
import styled from 'styled-components';
import { ModalHeader } from '@tupaia/ui-components';

const Wrapper = styled.div`
  height: 80vh;
  width: 80vw;
  max-width: 45rem;
  display: flex;
`;

export const TransformModal = ({ onClose, children }) => {
  return (
    <Dialog open onClose={onClose} maxWidth={false}>
      <ModalHeader onClose={onClose} />
      <Wrapper>{children}</Wrapper>
    </Dialog>
  );
};

TransformModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
