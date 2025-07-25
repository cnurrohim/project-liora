const isDev = true; // bisa kamu ganti pakai import.meta.env.DEV nanti kalau pakai Vite

export function createLogger(name) {
  return {
    log(method, args, resultState) {
      if (!isDev) return;

      console.log(
        `%c[${name}] %c${method}`,
        "color: gray",
        "color: blue; font-weight: bold;",
        ...args,
        "\n→", resultState
      );
    }
  };
}
