import { IconRenderer } from "../../components/IconRenderer";

export default function NoTabOpen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-[400px] mb-2 text-gray-900">
        <IconRenderer
          name="RiGhostSmileLine"
          className="text-gray-900"
          size={300}
        />
      </div>
      <div className="text-center text-sm">No Tab Open</div>
    </div>
  );
}
