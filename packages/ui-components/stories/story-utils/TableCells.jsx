import React from 'react';
import { Error } from '@material-ui/icons';
import styled from 'styled-components';

export const SitesReportedCell = data => {
  return <span>{`${data.sitesReported}/30`}</span>;
};

const AFRAlert = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: ${props => props.theme.palette.warning.light};
  border-radius: 5px;
  color: ${props => props.theme.palette.warning.main};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;

  .MuiSvgIcon-root {
    width: 20px;
    height: 20px;
    margin-left: 5px;
  }
`;

export const AFRCell = ({ AFR }) => {
  if (AFR > 500) {
    return (
      <AFRAlert>
        {AFR}
        <Error />
      </AFRAlert>
    );
  }

  return AFR;
};
