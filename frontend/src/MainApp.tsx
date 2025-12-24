// React hooks
import { useInitApp } from "./hooks/useInitApp";

// Components
import Loading from "./pages/Misc/Loading.tsx";
import ConfirmationDialog from "./components/ConfirmationDialog";
import { Toaster } from "sonner";
import { LayoutRenderer } from "./components/LayoutRenderer.tsx";

export default function App() {
  const { isReady } = useInitApp();

  if (!isReady) return <Loading />;

  return (
    <div className="bg-gray-950 w-full h-screen flex flex-col text-(--content-text)">
      <Toaster
        position="top-center"
        toastOptions={{
          closeButton: true,
          classNames: {
            toast:
              "!bg-(--content-surface) !text-(--content-text) border !border-(--content-border)",
            title: "!text-(--content-text)",
            description: "!text-(--content-text)",
          },
        }}
      />
      <LayoutRenderer />
      <ConfirmationDialog />
    </div>
  );
}
