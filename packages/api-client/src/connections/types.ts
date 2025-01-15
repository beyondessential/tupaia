// Using a mapped type will strip out private properties of a class
export type PublicInterface<T> = {
  [Prop in keyof T]: T[Prop];
};
