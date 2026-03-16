import { RouterProvider } from "react-router-dom";
import { router } from "./routes.js";
import { ProjectsProvider } from "./app/context/ProjectsContext.jsx";
import { AuthProvider } from "./app/context/AuthContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <RouterProvider router={router} />
      </ProjectsProvider>
    </AuthProvider>
  );
}
