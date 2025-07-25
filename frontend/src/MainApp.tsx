// React hooks
import { useController } from "./hooks/useController";
import { LayoutController } from "./controller/layoutController";

// Hooks
import { useInitApp } from "./hooks/useInitApp";

// Pages
import Loading from "./pages/Loading";
import EmptyPage from "./pages/Empty";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { Toaster } from "sonner";

export default function App() {
  const { isReady } = useInitApp();

  const layout = useController(LayoutController, (s) => ({
    leftPane: s.leftPane,
    rightPane: s.rightPane,
    topPane: s.topPane,
    bottomPane: s.bottomPane,
    content: s.content,
  }));

  if (!isReady) return <Loading />;

  return (
    <div className="bg-gray-950 w-full h-screen flex flex-col">
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast: "!bg-gray-900 !text-white !border !border-gray-700",
            title: "!text-white",
            description: "!text-gray-400",
          },
        }}
      />
      <div className="flex flex-1 min-h-0 min-w-0">
        {layout.leftPane && (
          <div className="flex-shrink-0">{layout.leftPane}</div>
        )}

        <main id="mainContent" className="flex flex-col flex-1 min-w-0 h-full">
          {layout.topPane && <div className="w-full">{layout.topPane}</div>}
          {layout.content ?? <EmptyPage />}
          {layout.bottomPane && (
            <div className="w-full">{layout.bottomPane}</div>
          )}
        </main>

        {layout.rightPane && (
          <div className="flex-shrink-0">{layout.rightPane}</div>
        )}
        <ConfirmationDialog />
      </div>
    </div>
  );
}
