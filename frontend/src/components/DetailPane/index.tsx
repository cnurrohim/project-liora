// src/components/DetailPane/index.tsx
import { useSyncExternalStore } from "react";
import { DetailPaneController } from "./controller";

export default function DetailPane() {
  const state = useSyncExternalStore(
    DetailPaneController.subscribe,
    DetailPaneController.getState
  );

  if (!state.visible || !state.data) return null;

  const { name, description, permissions } = state.data;

  return (
    <div className="fixed inset-0 flex justify-end z-50 bg-black/30 backdrop-blur-sm">
      <div className="w-full md:w-[28rem] h-full bg-gray-900 text-white shadow-xl transform transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">{name}</h2>
          <button
            onClick={() => DetailPaneController.close()}
            className="text-gray-400 hover:text-white text-2xl font-bold"
            title="Tutup"
          >
            &times;
          </button>
        </div>

        <div className="p-4 overflow-auto h-full space-y-4">
          <div>
            <p className="text-sm text-gray-400">Deskripsi</p>
            <p className="text-white">{description || "-"}</p>
          </div>

          {Object.entries(permissions).map(([domain, perms]) => (
            <details key={domain} className="bg-gray-800 rounded">
              <summary className="cursor-pointer px-4 py-2 font-semibold">
                {domain}
                <span className="ml-2 text-sm text-gray-400">
                  ({perms.length})
                </span>
              </summary>
              <div className="p-4 text-sm space-y-2">
                {perms.map((p) => (
                  <div key={p.id} className="border-b border-gray-700 pb-2">
                    <div className="font-semibold text-white">{p.label}</div>
                    <div className="text-gray-400 text-sm">{p.description}</div>
                    <div className="text-gray-500 text-xs italic">{p.name}</div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
