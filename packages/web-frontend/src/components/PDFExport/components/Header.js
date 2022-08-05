import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexCenter as BaseFlexCenter, FlexColumn as BaseFlexColumn } from '@tupaia/ui-components';
import { TUPAIA_DARK_LOGO_SRC } from '../../../constants';

const FlexCenter = styled(BaseFlexCenter)`
  position: relative;
  padding: 50px;
`;

const FlexColumn = styled(BaseFlexColumn)`
  text-align: center;
`;

const Heading = styled.div`
  font-weight: 600;
  line-height: 140%;
  font-size: 26px;
  text-transform: capitalize;
`;

const Logo = styled.img`
  top: 30px;
  left: 19px;
  position: absolute;
`;

const Header = ({ entityName }) => {
  return (
    <FlexCenter>
      <Logo src={TUPAIA_DARK_LOGO_SRC} alt="Tupaia logo" width="74" height="30" />
      <FlexColumn>
        <Heading>{entityName}</Heading>
      </FlexColumn>
    </FlexCenter>
  );
};

Header.propTypes = {
  entityName: PropTypes.string.isRequired,
};

Header.defaultProps = {};

export default Header;
