/**
 * @internal
 */
export const unreachable = (_: never): never => {
  throw new Error("unreachable");
};

/**
 * @internal
 */
export function invariant(cond: any, message: string): asserts cond {
  if (!cond) throw new Error(message);
}
