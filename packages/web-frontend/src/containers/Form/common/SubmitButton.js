import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../../components/Buttons';

const ButtonComponent = ({ text, handleClick, className }) => (
  <PrimaryButton onClick={handleClick} className={className} type="submit">
    {text}
  </PrimaryButton>
);

ButtonComponent.propTypes = {
  text: PropTypes.string.isRequired,
  handleClick: PropTypes.func,
  className: PropTypes.string,
};

ButtonComponent.defaultProps = {
  className: null,
  handleClick: () => {},
};

export const SubmitButton = styled(ButtonComponent)`
  width: 220px;
  height: 40px;
  margin-top: ${props => (props.gutterTop ? '16px' : '0')};
`;

SubmitButton.propTypes = {
  gutterTop: PropTypes.bool,
};

SubmitButton.defaultProps = {
  gutterTop: false,
};
