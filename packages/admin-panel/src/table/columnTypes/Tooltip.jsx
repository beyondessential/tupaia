import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Tooltip as TooltipComponent } from '@tupaia/ui-components';
import styled from 'styled-components';

const Content = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const useTooltip = column => {
  const [displayTooltip, setDisplayTooltip] = useState(true);
  const contentRef = useRef(null);
  const { width } = column;

  useEffect(() => {
    if (contentRef.current) {
      const { scrollWidth } = contentRef.current;

      setDisplayTooltip(scrollWidth >= width - 18); // 18 allows for padding of the cell
    }
  }, [width, contentRef.current]);

  return { displayTooltip, contentRef };
};

export const Tooltip = ({ value, column }) => {
  const { displayTooltip, contentRef } = useTooltip(column);

  if (!displayTooltip) {
    return <Content ref={contentRef}>{value}</Content>;
  }

  return (
    <TooltipComponent title={value || ''} placement="top-start">
      <Content ref={contentRef}>{value}</Content>
    </TooltipComponent>
  );
};

Tooltip.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
  column: PropTypes.object.isRequired,
};

Tooltip.defaultProps = {
  value: '',
};

export const JSONTooltip = ({ value, column }) => {
  const { displayTooltip, contentRef } = useTooltip(column);

  if (!displayTooltip) {
    return <Content ref={contentRef}>{JSON.stringify(value)}</Content>;
  }
  return (
    <TooltipComponent title={<pre>{JSON.stringify(value, null, 1)}</pre>}>
      <Content ref={contentRef}>{JSON.stringify(value)}</Content>
    </TooltipComponent>
  );
};

JSONTooltip.propTypes = {
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
  column: PropTypes.object.isRequired,
};

JSONTooltip.defaultProps = {
  value: '',
};
