import { wiringMap } from "../index";

describe("wiringMap", () => {
  test("wiringMap is an array of object contain 'from' and 'to'", () => {
    expect(Array.isArray(wiringMap)).toBe(true);

    wiringMap.forEach((route) => {
      expect(route).toHaveProperty("from");
      expect(route).toHaveProperty("to");
    });
  });

  test("type of from and to is a function", () => {
    wiringMap.forEach(({ from, to }) => {
      expect(typeof from).toBe("function");
      expect(typeof to).toBe("function");
    });
  });
});
