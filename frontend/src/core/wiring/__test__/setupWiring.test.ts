import { setupWiring } from "../setupWiring";
import type { Wire } from "../setupWiring";

describe("setupWiring", () => {
  it("memanggil connectFn untuk setiap pasangan from-to yang valid", () => {
    const connectFn = jest.fn();
    const wiringMap = [
      { from: jest.fn(), to: jest.fn() },
      { from: jest.fn(), to: jest.fn() },
    ];

    setupWiring(wiringMap, connectFn);

    expect(connectFn).toHaveBeenCalledTimes(2);
    expect(connectFn).toHaveBeenCalledWith(wiringMap[0].from, wiringMap[0].to);
    expect(connectFn).toHaveBeenCalledWith(wiringMap[1].from, wiringMap[1].to);
  });

  it("tidak memanggil connectFn jika from atau to tidak ada", () => {
    const connectFn = jest.fn();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const wiringMap = [
      { from: jest.fn(), to: undefined },
      { from: undefined, to: jest.fn() },
    ] as unknown as Wire[];

    setupWiring(wiringMap, connectFn);

    expect(connectFn).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });
});
