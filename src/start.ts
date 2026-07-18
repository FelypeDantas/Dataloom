/* eslint-disable prettier/prettier */
import { createMiddleware, createStart } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
} as const;

interface HttpError {
  statusCode: number;
}

function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error
  );
}

function createInternalServerErrorResponse() {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: HTML_HEADERS,
  });
}

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error: unknown) {
    // Preserve TanStack/HTTP errors
    if (isHttpError(error)) {
      throw error;
    }

    if (import.meta.env.DEV) {
      console.error("Unhandled server error:", error);
    }

    return createInternalServerErrorResponse();
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
}));