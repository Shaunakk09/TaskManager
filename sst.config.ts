// eslint-disable-next-line @typescript-eslint/triple-slash-reference
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
    // Create a new Next.js app
    const web = new sst.aws.Nextjs("MyWeb", {
      environment: {
        // Supabase configuration
        NEXT_PUBLIC_SUPABASE_URL: "https://gyqbypcxwcvkfspzqvpl.supabase.co",
        NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "",
      },
    });

    return {
      NextjsUrl: web.url,
    };
  },
});
