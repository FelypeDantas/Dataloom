import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

function createQueryClient() {
  return new QueryClient();
}

export function getRouter() {
  const queryClient = createQueryClient();

  return createRouter({
    routeTree,

    context: {
      queryClient,
    },

    scrollRestoration: true,

    // Always reload loaders when preloading.
    defaultPreloadStaleTime: 0,
  });
}
