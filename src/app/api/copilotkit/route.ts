import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const BACKEND_URL =
  process.env.COPILOTKIT_BACKEND_URL || "http://localhost:8000";

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: new CopilotRuntime({
      remoteEndpoints: [
        {
          url: `${BACKEND_URL}/copilotkit`,
        },
      ],
    }),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
