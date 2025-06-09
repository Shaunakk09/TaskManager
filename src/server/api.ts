/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApiGatewayV1 } from 'sst/constructs';

export function createApi() {

  // Create API
  const api = new ApiGatewayV1('api', {
    defaults: {
      function: {
        environment: {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
          NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY!,
        },
      },
    },
    routes: {
      // Get all tasks
      'GET /tasks': {
        function: {
          handler: 'src/server/handlers/tasks.getTasks',
        },
      },
      // Create a new task
      'POST /tasks': {
        function: {
          handler: 'src/server/handlers/tasks.createTask',
        },
      },
      // Update a task
      'PUT /tasks/{id}': {
        function: {
          handler: 'src/server/handlers/tasks.updateTask',
        },
      },
      // Delete a task
      'DELETE /tasks/{id}': {
        function: {
          handler: 'src/server/handlers/tasks.deleteTask',
        },
      },
    },
  });

  return api;
} 