import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Studio from "./pages/Studio";
import AssetsPage from "./pages/AssetsPage";

export const routers = [
    {
      path: "/",
      name: 'home',
      element: <Index />,
    },
    {
      path: "/project/:projectId",
      name: 'project-studio',
      element: <Studio />,
    },
    {
      path: "/project/assets",
      name: 'assets',
      element: <AssetsPage />,
    },
    /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
    {
      path: "*",
      name: '404',
      element: <NotFound />,
    },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;