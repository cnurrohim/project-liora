// utils/raveEffect.ts

export function startRave(intervalMs: number = 200) {
  const colors = [
    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
    "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
  ];

  const colorList = [...colors].sort(() => Math.random() - 0.5);
  let colorIndex = 0;

  const tailwindPrefixes = [
    "bg", "text", "border", "ring", "outline", "from", "to", "via",
  ];

  const excludedColors = ["gray"];

  function updateColors() {
    const elements = document.querySelectorAll("*");
    const currentColor = colorList[colorIndex];
    const regex = new RegExp(
      `^(${tailwindPrefixes.join("|")})-(\\w+)-(\\d{2,3})$`
    );

    elements.forEach((el) => {
      [...el.classList].forEach((cls) => {
        const match = cls.match(regex);
        if (match) {
          const [full, prefix, oldColor, weight] = match;

          if (!excludedColors.includes(oldColor)) {
            const newClass = `${prefix}-${currentColor}-${weight}`;
            el.classList.remove(full);
            el.classList.add(newClass);
            el.classList.add("transition-all");
          }
        }
      });
    });

    colorIndex = (colorIndex + 1) % colorList.length;
  }

  const intervalId = setInterval(updateColors, intervalMs);

  return () => clearInterval(intervalId); // untuk cleanup
}
