import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelectedProjectCode } from './useSelectedProject';

export const ProjectQueryInvalidator = () => {
  const projectCode = useSelectedProjectCode();
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
