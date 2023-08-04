import { UseQueryResult as ReactQueryUseQueryResult } from 'react-query';

declare module 'react-query' {
  export type UseQueryResult = Omit<ReactQueryUseQueryResult, 'error'> & {
    error?: ReactQueryUseQueryResult['error'] & {
      code?: number;
    }; // override this to make code a valid type, as it is not present in types with react-query
  };
}
