import { type Either, left, right } from '../common/either'
import { Task } from '../entities/task'
import type { TaskRepository } from '../repositories/task-repo'
import { InvalidTitleError } from './_errors/invalid-title-error'

type CreateTaskRequest = { title: string; client_id: string }

type CreateTaskResponse = Either<
  InvalidTitleError,
  {
    task: Task
  }
>

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute({ title, client_id }: CreateTaskRequest): Promise<CreateTaskResponse> {
    if (!Task.isValidTitle(title)) {
      return left(new InvalidTitleError())
    }

    const task = await this.taskRepository.create(new Task({ title, client_id }))
    return right({ task })
  }
}
