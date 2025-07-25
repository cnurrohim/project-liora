import { useState, useEffect } from "react";

/**
 * React hook for subscribing to a controller's state and extracting a selected value.
 *
 * This hook connects a controller (an object with `getState`, `subscribe`, and `unsubscribe` methods)
 * to a React component, allowing reactive updates when the state changes.
 *
 * Optionally, a `selector` function can be provided to extract only the part of the state you care about.
 * A custom `isEqual` function can also be passed to prevent unnecessary updates.
 *
 * @template TState - The full shape of the controller's state.
 * @template TSelected - The selected value returned from the state.
 *
 * @param controller - An object with `getState`, `subscribe`, and `unsubscribe` methods.
 * @param selector - A function to select part of the state. Defaults to the identity function.
 * @param isEqual - A function to compare selected values. Defaults to `Object.is`.
 *
 * @returns The selected value from the controller's state that updates reactively.
 *
 * @example
 * const count = useController(counterController, (state) => state.count);
 */
export function useController<TState, TSelected = TState>(
  controller: {
    getState: () => TState;
    subscribe: (cb: () => void) => void;
    unsubscribe: (cb: () => void) => void;
  },
  selector: (s: TState) => TSelected = (s) => s as unknown as TSelected,
  isEqual: (a: TSelected, b: TSelected) => boolean = Object.is
): TSelected {
  const [selected, setSelected] = useState(() => selector(controller.getState()));

  useEffect(() => {
    const cb = () => {
      const next = selector(controller.getState());
      setSelected((prev) => (isEqual(prev, next) ? prev : next));
    };
    controller.subscribe(cb);
    return () => controller.unsubscribe(cb);
  }, [controller, selector, isEqual]);

  return selected;
}



/**
 * Performs a shallow comparison between two objects.
 *
 * This function compares if both objects have the same keys and if each corresponding value
 * is strictly equal using `Object.is`. It does not check nested objects deeply.
 *
 * @template T - An object type with string keys.
 * @param a - The first object to compare.
 * @param b - The second object to compare.
 * @returns `true` if both objects are shallowly equal, otherwise `false`.
 *
 * @example
 * shallowEqual({ x: 1, y: 2 }, { x: 1, y: 2 }); // true
 * shallowEqual({ x: 1 }, { x: 1, y: 2 }); // false
 */
function shallowEqual<T extends Record<string, any>>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;

  const aKeys = Object.keys(a), bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (let key of aKeys) {
    if (!Object.is(a[key], b[key])) return false;
  }

  return true;
}



/**
 * Performs a deep comparison between two objects.
 *
 * Recursively checks if both objects have the same keys and deeply equal values.
 * It works for nested structures but is slower than shallow equality checks.
 *
 * @template T - An object type to be compared.
 * @param a - The first object to compare.
 * @param b - The second object to compare.
 * @returns `true` if both objects are deeply equal, otherwise `false`.
 *
 * @example
 * deepEqual({ x: { y: 1 } }, { x: { y: 1 } }); // true
 * deepEqual({ x: { y: 1 } }, { x: { y: 2 } }); // false
 */
export function deepEqual<T extends object>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!(key in b)) return false;

    const valA = a[key];
    const valB = b[key];

    const isObjA = typeof valA === "object" && valA !== null;
    const isObjB = typeof valB === "object" && valB !== null;

    if (isObjA && isObjB) {
      if (!deepEqual(valA as object, valB as object)) return false;
    } else {
      if (!Object.is(valA, valB)) return false;
    }
  }

  return true;
}


