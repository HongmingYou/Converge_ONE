import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import { routers } from "./router";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProjectProvider } from "./context/ProjectContext";

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter(routers);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ProjectProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <RouterProvider router={router} />
          </TooltipProvider>
        </ProjectProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
};

export default App;
