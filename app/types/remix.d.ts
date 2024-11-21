import '@remix-run/node'

import type { user } from "@prisma/client";
declare module "@remix-run/node" {
  export interface AppLoadContext {
    user: user;
  }
}
