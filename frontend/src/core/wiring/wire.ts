/**
 * A function that accepts a callback to emit data. 
 * Typically used for registering listeners or subscribers.
 */
type OutputFn = ((cb: (...args: any[]) => void) => void) | undefined;

/**
 * A generic input handler that accepts arguments emitted from an output.
 */
type InputFn = ((...args: any[]) => void) | undefined;


/**
 * Connects an output function to an input function.
 *
 * This is the core utility that binds emitters (`outputFn`) to listeners (`inputFn`).
 * It first checks whether `outputFn` is a valid function. If so, it passes `inputFn` to it,
 * effectively wiring the two together. If `outputFn` is invalid, a warning is logged.
 *
 * This function gracefully handles missing or undefined outputs, which is useful
 * when working with partially defined or empty wiring maps.
 *
 * @param outputFn - The source function that emits or forwards events.
 * @param inputFn - The target function to receive emitted values.
 */
export function connectOutputToInput(
  outputFn: OutputFn,
  inputFn: InputFn
) {
  if (typeof outputFn !== "function" || typeof inputFn !== "function") {
    console.warn("Invalid output or input, must be functions", { outputFn, inputFn });
    return;
  }

  outputFn(inputFn);
}

