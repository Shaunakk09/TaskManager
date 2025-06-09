/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "frontend",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      region: "us-east-1",
    };
  },
  async run() {
    // Create API
    const api = new sst.aws.ApiGatewayV1("api", {
      transform: {
        route: {
          handler: {
            environment: {
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
              NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY!,
            },
          },
        },
      },
    });

    // Add routes
    api.route("GET /tasks", "src/server/handlers/tasks.getTasks");
    api.route("POST /tasks", "src/server/handlers/tasks.createTask");
    api.route("PUT /tasks/{id}", "src/server/handlers/tasks.updateTask");
    api.route("DELETE /tasks/{id}", "src/server/handlers/tasks.deleteTask");

    // Create a new Next.js app
    const web = new sst.aws.Nextjs("MyWeb", {
      environment: {
        // Supabase configuration
        NEXT_PUBLIC_SUPABASE_URL: "https://gyqbypcxwcvkfspzqvpl.supabase.co",
        NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "",
        NEXT_PUBLIC_API_URL: api.url,
      },
    });

    return {
      NextjsUrl: web.url,
      ApiUrl: api.url,
    };
  },
});
