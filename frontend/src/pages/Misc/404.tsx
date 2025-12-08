import { IconRenderer } from "@/components/IconRenderer";

export default function PagesNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-[400px] mb-2 text-gray-900">
        <IconRenderer
          name="RiQuestionLine"
          className="text-amber-300"
          size={300}
        />
      </div>
      <div className="text-center text-sm">
        <h1 className="font-logo text-xl text-amber-300">
          404 - Page Not Found
        </h1>
      </div>
    </div>
  );
}
