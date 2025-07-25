import { render, screen } from "@testing-library/react";
import { act } from "react";
import "@testing-library/jest-dom";
import { useController } from "../useController";

// Mock controller
function createTestController() {
  let state = { count: 0 };
  let subscribers: (() => void)[] = [];

  return {
    getState: () => state,
    subscribe: (cb: () => void) => subscribers.push(cb),
    unsubscribe: (cb: () => void) => {
      subscribers = subscribers.filter((fn) => fn !== cb);
    },
    setCount: (val: number) => {
      state.count = val;
      subscribers.forEach((cb) => cb());
    },
  };
}

function TestComponent({ controller }: { controller: any }) {
  const count = useController<{ count: number }, number>(controller, (s) => s.count);
  return <div>Count: {count}</div>;
}

test("useController reacts to state changes", () => {
  const controller = createTestController();
  render(<TestComponent controller={controller} />);
  expect(screen.getByText("Count: 0")).toBeInTheDocument();

  act(() => {
    controller.setCount(42); // wrap in act()
  });

  expect(screen.getByText("Count: 42")).toBeInTheDocument();
});
