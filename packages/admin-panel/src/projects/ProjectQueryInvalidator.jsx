import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { selectSelectedProjectCode } from './selectors';

export const ProjectQueryInvalidator = () => {
  const projectCode = useSelector(selectSelectedProjectCode);
  const queryClient = useQueryClient();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    queryClient.invalidateQueries();
  }, [projectCode, queryClient]);

  return null;
};
