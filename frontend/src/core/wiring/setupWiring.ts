/**
 * Describes a connection (wire) between an output and an input function.
 * Both `from` and `to` are optional to allow flexibility during wiring definition.
 */
export type Wire = {
  from?: (...args: any[]) => void;
  to?: (...args: any[]) => void;
};

/**
 * Establishes connections between components or modules using the provided wiring map.
 *
 * For each entry in the `wiringMap`, this function checks whether both `from` and `to`
 * are valid functions. If they are, it invokes `connectFn` to link them.
 * If either side is invalid or missing, a warning is logged but the process continues.
 *
 * @param wiringMap - An array of wire connections to be processed.
 * @param connectFn - A function that connects a `from` function to a `to` function.
 */
export function setupWiring(
  wiringMap: Wire[],
  connectFn: (from: Wire["from"], to: Wire["to"]) => void
) {
  wiringMap.forEach(({ from, to }) => {
    if (typeof from === "function" && typeof to === "function") {
      connectFn(from, to);
    } else {
      console.warn("Invalid route", { from, to });
    }
  });
}
