import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Country, Project } from '@tupaia/types';
import { post } from '../api';

type RequestCountryAccessParams = {
  entityIds: Country['id'][];
  message?: string;
  projectCode?: Project['code'];
};

interface ResponseBody {
  message: string;
}

interface RequestProjectAccessOptions {
  onError?: (error: Error) => void;
  onSettled?: () => void;
  onSuccess?: (response: ResponseBody) => void;
}

export const useRequestProjectAccess = (options?: RequestProjectAccessOptions) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, RequestCountryAccessParams, unknown>(
    ({ entityIds, message, projectCode }: RequestCountryAccessParams) => {
      return post('me/requestCountryAccess', {
        data: {
          entityIds: Array.isArray(entityIds) ? entityIds : [entityIds], // Ensure entityIds is an array, as when there is only one option in a checkbox list, react-hook-form formats this as a single value string
          message,
          projectCode,
        },
      });
    },
    {
      onError(error: Error) {
        options?.onError?.(error);
      },
      onSettled() {
        options?.onSettled?.();
      },
      async onSuccess(response: ResponseBody) {
        await queryClient.invalidateQueries({ queryKey: ['me/countries'] });
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        options?.onSuccess?.(response);
      },
    },
  );
};
