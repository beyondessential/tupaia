import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  ReactNode,
  ReactElement,
} from 'react';
import MuiTabs from '@material-ui/core/Tabs';
import MuiTab from '@material-ui/core/Tab';
import styled from 'styled-components';

interface TabContextProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const TabsContext = createContext<TabContextProps | null>(null);

/**
 * CardTabs are composable using `CardTabs`, `TabList`, `Tab`, `TabPanels` and `TabPanel`.
 * An alternative `DataTabs` api can be used to pass in labels and panels in an array.
 */
export const CardTabs = ({ children }: { children: ReactNode[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>{children}</TabsContext.Provider>
  );
};

const StyledTabs = styled(MuiTabs)`
  .MuiTabs-indicator {
    display: none;
  }
`;

export const CardTabList = ({
  children,
  Context = TabsContext,
}: {
  children: ReactNode;
  Context?: typeof TabsContext;
}) => {
  const { activeIndex, setActiveIndex } = useContext(Context)!;
  const handleChange = useCallback(
    (event: any, newValue: number) => {
      setActiveIndex(newValue);
    },
    [setActiveIndex],
  );
  return (
    <StyledTabs value={activeIndex} onChange={handleChange} variant="fullWidth">
      {children}
    </StyledTabs>
  );
};

export const CardTab = styled(({ children, ...props }) => <MuiTab {...props} label={children} />)`
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  background: ${props => props.theme.palette.grey['100']};
  color: ${props => props.theme.palette.grey['500']};
  padding: 1rem 0.75rem;
  min-width: 5rem;

  &:last-child {
    border-right: none;
  }

  &.Mui-selected {
    background: white;
    color: ${props => props.theme.palette.primary.main};
    border-bottom: 1px solid transparent;
  }
`;

export const CardTabPanels = ({
  children,
  Context = TabsContext,
}: {
  children: ReactElement[];
  Context?: typeof TabsContext;
}) => {
  const { activeIndex } = useContext(Context)!;
  return children[activeIndex];
};

export const CardTabPanel = styled.div`
  padding: 1.5rem;
`;

/*
 * CardTabs with an array api. Each entry in 'data' should contain 'label' and 'content' fields.
 */
export const DataCardTabs = ({ data }: { data: { label: string; content: ReactNode }[] }) => {
  return (
    <CardTabs>
      <CardTabList>
        {data.map((tab, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <CardTab key={index}>{tab.label}</CardTab>
        ))}
      </CardTabList>
      <CardTabPanels>
        {data.map((tab, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <CardTabPanel key={index}>{tab.content}</CardTabPanel>
        ))}
      </CardTabPanels>
    </CardTabs>
  );
};
