import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainApp from "./MainApp";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
