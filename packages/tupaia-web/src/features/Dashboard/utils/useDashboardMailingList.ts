import { useParams } from 'react-router';
import { useDashboard } from './useDashboard';

export const useDashboardMailingList = () => {
  const { entityCode } = useParams();
  const { activeDashboard } = useDashboard();
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
