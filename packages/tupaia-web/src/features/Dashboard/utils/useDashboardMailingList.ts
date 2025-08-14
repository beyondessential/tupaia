import { useParams } from 'react-router';
import { useDashboardContext } from './useDashboardContext';

export const useDashboardMailingList = () => {
  const { entityCode } = useParams();
  const { activeDashboard } = useDashboardContext();
  if (!activeDashboard) {
    return undefined;
  }

  const { mailingLists } = activeDashboard;
  if (!mailingLists) {
    return undefined;
  }

  const mailingList = mailingLists.find(
    ({ entityCode: mailingListEntityCode }) => mailingListEntityCode === entityCode,
  );

  return mailingList;
};
