import { IconRenderer } from "../../components/IconRenderer";

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <div className="text-[400px] mb-2 text-gray-900">
        <IconRenderer
          name="RiForbid2Line"
          className="text-red-500"
          size={300}
        />
      </div>
      <div className="text-center text-sm">
        <h1 className="font-logo text-xl text-red-500">
          403 - Tidak Diizinkan
        </h1>
      </div>
    </div>
  );
}
