import { CirclePicker } from "react-color";

interface ColorCirclePickerProps {
  color: string;
  onChange: (color: string) => void;
  colors?: string[];
}

export default function ColorCirclePicker({
  color,
  onChange,
  colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#607d8b",
    "#000000",
    "#ffffff",
  ],
}: ColorCirclePickerProps) {
  return (
    <div>
      <CirclePicker
        color={color}
        colors={colors}
        onChange={(colorResult) => onChange(colorResult.hex)}
      />
    </div>
  );
}
