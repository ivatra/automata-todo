import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { TStatus } from "src/domain/repositories/task-repo";
import { FetchTasksUseCase } from "src/domain/use-cases/fetch-tasks";
import { z } from "zod";

import { BadRequestError } from "../_errors/bad-request-error";
import { Db } from "../database/db";
import { TaskPresenter } from "../presenters/task-presenter";
import { DrizzleTaskRepository } from "../repositories/drizzle-task-repo";
import { Task } from "src/domain/entities/task";

//create mock tasks (5 completed, 5 pending)
const TASKS_MOCK = [
  {
    id: "1",
    title: "Task 1",
    createdAt: new Date().toString(),
    completedAt: new Date().toString(),
  },
  {
    id: "2",
    title: "Task 2",
    createdAt: new Date().toString(),
    completedAt: new Date().toString(),
  },
  {
    id: "3",
    title: "Task 3",
    createdAt: new Date().toString(),
    completedAt: new Date().toString(),
  },
  {
    id: "4",
    title: "Task 4",
    createdAt: new Date().toString(),
    completedAt: new Date().toString(),
  },
  {
    id: "5",
    title: "Task 5",
    createdAt: new Date().toString(),
    completedAt: new Date().toString(),
  },
  {
    id: "6",
    title: "Task 6",
    createdAt: new Date().toString(),
    completedAt: null,
  },
  {
    id: "7",
    title: "Task 7",
    createdAt: new Date().toString(),
    completedAt: null,
  },
  {
    id: "8",
    title: "Task 8",
    createdAt: new Date().toString(),
    completedAt: null,
  },
  {
    id: "9",
    title: "Task 9",
    createdAt: new Date().toString(),
    completedAt: null,
  },
  {
    id: "10",
    title: "Task 10",
    createdAt: new Date().toString(),
    completedAt: null,
  },
];

export const fetchTasksController = async (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    // .register(auth)
    .get(
      "/tasks",
      {
        schema: {
          tags: ["Tasks"],
          summary: "Fetch Tasks",
          response: {
            200: z.object({
              tasks: z.array(
                z.object({
                  id: z.string(),
                  title: z.string(),
                  createdAt: z.string(),
                  completedAt: z.string().nullable(),
                }),
              ),
            }),
            400: z.object({
              message: z.unknown(),
            }),
            401: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const db = await Db.getInstance();
        const taskRepo = new DrizzleTaskRepository(db);
        const fetchTasks = new FetchTasksUseCase(taskRepo);
        const { status, client_id } = request.query as {
          status: TStatus;
          client_id: string;
        };

        const result = await fetchTasks.execute({
          status,
          client_id,
        });
        if (result.isLeft()) {
          const error = result.value;
          switch (error.constructor) {
            default:
              throw new BadRequestError(error.message);
          }
        }

        const tasks = result.value.tasks;

        return reply.status(200).send({
          tasks: tasks.map(TaskPresenter.toHTTP),
        });
      },
    );
};
