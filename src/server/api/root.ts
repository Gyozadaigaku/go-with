import { createTRPCRouter } from "./trpc";
import { answerRouter } from "./routers/answer";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  answer: answerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
