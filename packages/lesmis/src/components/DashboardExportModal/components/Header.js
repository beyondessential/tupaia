import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexCenter as BaseFlexCenter, FlexColumn as BaseFlexColumn } from '@tupaia/ui-components';
import { Logo } from './Logo';
import { useUrlParams } from '../../../utils';
import { useEntityData } from '../../../api';

const FlexCenter = styled(BaseFlexCenter)`
  position: relative;
  padding: 50px;
`;

const FlexColumn = styled(BaseFlexColumn)`
  text-align: center;
`;

const BaseHeading = styled.p`
  font-weight: 600;
  line-height: 140%;
  text-transform: capitalize;
  margin: 0;
`;

const Heading = styled(BaseHeading)`
  font-size: 23px;
  color: ${props => props.theme.palette.primary.main};
`;

const SubHeading = styled(BaseHeading)`
  font-size: 17px;
`;

const Header = ({ dashboardLabel, useYearSelector, selectedYear }) => {
  const { entityCode } = useUrlParams();
  const { data: entityData } = useEntityData(entityCode);
  const entityName = entityData?.name ? entityData?.name : '';

  return (
    <FlexCenter>
      <Logo />
      <FlexColumn>
        <Heading>{dashboardLabel}</Heading>
        {useYearSelector && <SubHeading variant="h2">{`${selectedYear}·${entityName}`}</SubHeading>}
      </FlexColumn>
    </FlexCenter>
  );
};

Header.propTypes = {
  dashboardLabel: PropTypes.string.isRequired,
  useYearSelector: PropTypes.bool,
  selectedYear: PropTypes.string,
};

Header.defaultProps = {
  useYearSelector: false,
  selectedYear: null,
};

export default Header;
