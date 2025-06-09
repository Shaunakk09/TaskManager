/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'sst/constructs' {
  interface ApiGatewayV1Args {
    defaults?: {
      function?: {
        environment?: Record<string, string>;
      };
    };
    routes: Record<string, {
      function: {
        handler: string;
      };
    }>;
  }

  interface NextjsProps {
    environment?: Record<string, string>;
  }

  export class ApiGatewayV1 {
    constructor(name: string, props: ApiGatewayV1Args);
    url: string;
  }

  export class Nextjs {
    constructor(name: string, props: NextjsProps);
    url: string;
    addEnvironment(key: string, value: string): void;
    bind(bindings: any[]): void;
  }
} 