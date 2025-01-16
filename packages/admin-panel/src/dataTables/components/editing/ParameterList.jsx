import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { TextButton as BaseTextButton } from '@tupaia/ui-components';

const TextButton = styled(BaseTextButton)`
  font-weight: 500;
  line-height: 18px;
  font-size: 14px;
  text-underline-offset: 3px;
  text-decoration: underline;
  :hover {
    text-decoration: underline;
  }
`;

export const ParameterList = ({ children, onAdd }) => {
  const parameterListRef = useRef();
  const [scrollToTheBottom, setScrollToTheBottom] = useState(0);

  useEffect(() => {
    if (parameterListRef.current) {
      parameterListRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [scrollToTheBottom]);

  return (
    <div>
      <div>
        {children}
        <div ref={parameterListRef} />
      </div>
      <TextButton
        color="primary"
        onClick={() => {
          onAdd();
          setScrollToTheBottom(scrollToTheBottom + 1);
        }}
      >
        + Add
      </TextButton>
    </div>
  );
};

ParameterList.propTypes = {
  children: PropTypes.node.isRequired,
  onAdd: PropTypes.func.isRequired,
};
