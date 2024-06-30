import type { Task } from 'src/domain/entities/task'

export type TStatus = 'ALL' | 'COMPLETED' | 'PENDING'

export abstract class TaskRepository {
  abstract create(data: Task): Promise<Task>
  abstract save(data: Task): Promise<Task>
  abstract delete(data: Task): Promise<void>
  abstract findManyByStatus(status: TStatus, client_id: string): Promise<Task[]>
  abstract findById(taskId: string): Promise<Task | null>
}
