/* eslint-disable prettier/prettier */
import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

interface ServerEntry {
  fetch(
    request: Request,
    env: unknown,
    ctx: unknown,
  ): Promise<Response> | Response;
}

interface H3ErrorPayload {
  unhandled: true;
  message: "HTTPError";
}

function logServerError(
  consumeLastCapturedError() ??
    new Error(`H3 swallowed SSR error: ${body}`),
);

const HTML_HEADERS = {
  "content-type": "text/html; charset=utf-8",
} as const;

let serverEntryPromise: Promise<ServerEntry> | undefined;

function createInternalServerErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: HTML_HEADERS,
  });
}

async function getServerEntry(): Promise<ServerEntry> {
  serverEntryPromise ??= import("@tanstack/react-start/server-entry").then(
    (module) => (module.default ?? module) as ServerEntry,
  );

  return serverEntryPromise;
}

function isH3ErrorPayload(value: unknown): value is H3ErrorPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    payload.unhandled === true &&
    payload.message === "HTTPError"
  );
}

function parseH3Payload(body: string): H3ErrorPayload | null {
  try {
    const parsed = JSON.parse(body);

    return isH3ErrorPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function normalizeServerResponse(response: Response): Promise<Response> {
  const contentType = response.headers.get("content-type");
  
    if (
      response.status < 500 ||
      !contentType?.includes("application/json")
    ) {
      return response;
    }

  const body = await response.clone().text();

  if (!parseH3Payload(body)) {
    return response;
  }

  console.error(
    consumeLastCapturedError() ??
      new Error(`H3 swallowed SSR error: ${body}`),
  );

  return createInternalServerErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const server = await getServerEntry();
      const response = await server.fetch(request, env, ctx);

      return normalizeServerResponse(response);
    } catch (error) {
      logServerError(error);
      return createInternalServerErrorResponse();
    }
  },
};
