import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const answerRouter = createTRPCRouter({
  postAnswer: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        items: z.array(z.object({ answerContent: z.string() })),
      })
    )
    .mutation(({ ctx, input }) => {
      input.items.map(async (item) => {
        try {
          await ctx.prisma.answer.create({
            data: {
              name: input.name,
              userId: ctx.session.user.id,
              answerContent: item.answerContent,
            },
          });
        } catch (error) {
          console.log(error);
        }
      });
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.answer.findMany({
        select: {
          id: true,
          name: true,
          answerContent: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.log("error", error);
    }
  }),
  getOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.answer.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            name: true,
            answerContent: true,
            user: true,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }),
  deleteAnswer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.answer.delete({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }),
  updateAnswer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        answerContent: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.answer.update({
          where: {
            id: input.id,
          },
          data: {
            answerContent: input.answerContent,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    }),
});
