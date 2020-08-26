import 'jest-extended';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenCalledOnceWith<E extends any[]>(...params: E): R;
      toBeRejectedWith(error?: string | Constructable | RegExp | Error): Promise<R>;
    }
  }
}
