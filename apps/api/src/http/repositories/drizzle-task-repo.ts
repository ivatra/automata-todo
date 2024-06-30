import { eq, isNotNull, isNull, and } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Task } from "src/domain/entities/task";
import type {
  TaskRepository,
  TStatus,
} from "src/domain/repositories/task-repo";

import { DrizzleTaskMapper } from "../database/mappers/drizzle-task-mapper";
import * as schema from "../database/schema";

export class DrizzleTaskRepository implements TaskRepository {
  public items: Task[] = [];

  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async create(data: Task): Promise<Task> {
    await this.db
      .insert(schema.tasks)
      .values(DrizzleTaskMapper.toDrizzle(data));
    return data;
  }

  async save(data: Task): Promise<Task> {
    const toDb = DrizzleTaskMapper.toDrizzle(data);
    await this.db
      .update(schema.tasks)
      .set({
        title: toDb.title,
        completedAt: toDb.completedAt ?? null,
      })
      .where(eq(schema.tasks.id, data.id.toString()));
    return data;
  }

  async delete(data: Task): Promise<void> {
    await this.db
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, data.id.toString()));
  }

  async findManyByStatus(status: TStatus, client_id: string): Promise<Task[]> {
    // Build a list of where clauses based on status and client_id.
    type WhereExpr =
      | ReturnType<typeof eq>
      | ReturnType<typeof isNull>
      | ReturnType<typeof isNotNull>;

    const clauses: WhereExpr[] = [];

    if (status === "COMPLETED") {
      clauses.push(isNotNull(schema.tasks.completedAt));
    } else if (status === "PENDING") {
      clauses.push(isNull(schema.tasks.completedAt));
    }

    clauses.push(eq(schema.tasks.client_id, client_id));

    let rows;
    if (clauses.length === 0) {
      // no filters
      rows = await this.db.query.tasks.findMany();
    } else {
      // combine clauses using `and`. Use a narrow cast only for the reduce step
      // to satisfy the typechecker, the resulting `where` is a valid SQL expr.
      const where = clauses
        .slice(1)
        .reduce(
          (acc, c) => and(acc as any, c as any),
          clauses[0] as any,
        ) as ReturnType<typeof and>;
      rows = await this.db.query.tasks.findMany({ where });
    }

    return rows.map((task) => DrizzleTaskMapper.toDomain(task));
  }

  async findById(taskId: string): Promise<Task | null> {
    const task = await this.db.query.tasks.findFirst({
      where: eq(schema.tasks.id, taskId),
    });
    if (!task) {
      return null;
    }
    return DrizzleTaskMapper.toDomain(task);
  }
}
