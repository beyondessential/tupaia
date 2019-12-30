import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../../components/Buttons';

const ButtonComponent = styled(PrimaryButton)`
  width: 220px;
  height: 40px;
`;

export const SubmitButton = ({ text, handleClick }) => (
  <ButtonComponent onClick={handleClick}>{text}</ButtonComponent>
);

SubmitButton.propTypes = {
  text: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
};
