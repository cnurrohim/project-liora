import { connectOutputToInput } from "../wire";

describe("connectOutputToInput", () => {
  test("memanggil output function dengan input function sebagai argumen", () => {
    const inputFn = jest.fn();
    const outputFn = jest.fn();

    connectOutputToInput(outputFn, inputFn);

    // Pastikan outputFn dipanggil dengan inputFn
    expect(outputFn).toHaveBeenCalledTimes(1);
    expect(outputFn).toHaveBeenCalledWith(inputFn);
  });

  test("menampilkan warning jika output bukan function", () => {
    const inputFn = jest.fn();
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    connectOutputToInput(null as any, inputFn);

    expect(warnSpy).toHaveBeenCalledWith(
      "Invalid output or input, must be functions",
      { outputFn: null, inputFn }
    );

    warnSpy.mockRestore();
  });

});
