import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { FormLabelProps, Typography } from '@material-ui/core';
import RoomIcon from '@material-ui/icons/Room';
import { DatatrakWebEntityDescendantsRequest } from '@tupaia/types';
import { SelectList } from '@tupaia/ui-components';
import { useIsMobile } from '../../utils';
import { EntityResponseObject } from '../../utils/formatEntity';

const DARK_BLUE = '#004975';

const ListWrapper = styled.div`
  padding-block-start: 1rem;
  display: flex;
  flex-direction: column;
  overflow: auto;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    margin-block-start: 0.9rem;
    border-block-start: max(0.0625rem, 1px) solid ${({ theme }) => theme.palette.divider};
  }

  li .MuiSvgIcon-root:not(.MuiSvgIcon-colorPrimary) {
    color: ${DARK_BLUE};
    ${({ theme }) => theme.breakpoints.down('sm')} {
      font-size: 1.8rem;
    }
  }
`;

const SubListWrapper = styled.div`
  & + & {
    margin-block-start: 0.5rem;
  }
`;

const MobileResultItem = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.3;
  margin-left: 0.5rem;

  > div:last-child {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const ResultItem = ({ name, parentName }) => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileResultItem>
        <div>{name}</div>
        <div>{parentName}</div>
      </MobileResultItem>
    );
  }
  return (
    <>
      {name} | <span className="text-secondary">{parentName}</span>
    </>
  );
};

type ListItemType = Record<string, unknown> & {
  children?: ListItemType[];
  content: string | ReactNode;
  value: string;
  selected?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  button?: boolean;
  disabled?: boolean;
  labelProps?: FormLabelProps & {
    component?: React.ElementType;
  };
};

type SearchResults = EntityResponseObject[];
export interface ResultsListProps {
  value?: string;
  searchValue?: string;
  searchResults?: SearchResults;
  onSelect: (value: ListItemType) => void;
  showRecentEntities?: boolean;
  noResultsMessage?: string;
}

export const ResultsList = ({
  value,
  searchValue,
  searchResults,
  onSelect,
  showRecentEntities,
  noResultsMessage,
}: ResultsListProps) => {
  const getEntitiesList = (returnRecentEntities?: boolean) => {
    const entities = searchResults?.filter(({ isRecent }) =>
      returnRecentEntities ? isRecent : !isRecent,
    );
    return (
      entities?.map(({ name, parentName, code, id }) => ({
        content: <ResultItem name={name} parentName={parentName} />,
        value: id,
        code,
        selected: id === value,
        icon: <RoomIcon />,
        button: true,
      })) ?? []
    );
  };
  const recentEntities = showRecentEntities ? getEntitiesList(true) : [];
  const displayResults = getEntitiesList(false);

  return (
    <ListWrapper>
      {recentEntities?.length > 0 && (
        <SubListWrapper>
          <SelectList
            items={recentEntities}
            onSelect={onSelect}
            subTitle="Recently used"
            variant="borderless"
          />
        </SubListWrapper>
      )}
      <SubListWrapper>
        <SelectList
          items={displayResults}
          onSelect={onSelect}
          variant="borderless"
          noResultsMessage={noResultsMessage}
          subTitle={showRecentEntities && !searchValue ? 'All' : null}
        />
      </SubListWrapper>
    </ListWrapper>
  );
};
