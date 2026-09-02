import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '../../VizBuilderApp/api';

export const useSaveSelectedProject = () => {
  const queryClient = useQueryClient();
  return useMutation(projectId => put('me', { data: { project_id: projectId } }), {
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
    },
  });
};
