import { type Either, right } from 'src/domain/common/either'
import type { Task } from 'src/domain/entities/task'
import type { TaskRepository, TStatus } from 'src/domain/repositories/task-repo'

import { InvalidTitleError } from './_errors/invalid-title-error'

type FetchTasksRequest = { status: TStatus; client_id: string }

type FetchTasksResponse = Either<
  InvalidTitleError,
  {
    tasks: Task[]
  }
>

export class FetchTasksUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute({ status, client_id }: FetchTasksRequest): Promise<FetchTasksResponse> {
    const tasks = await this.taskRepository.findManyByStatus(status, client_id)
    return right({ tasks })
  }
}
