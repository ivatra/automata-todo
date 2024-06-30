import { api } from '../lib/ky'

type CreateTaskRequest = {
  title: string;
  client_id: string;
}

export async function createTask({ title, client_id }: CreateTaskRequest): Promise<void> {
  // client-side validation to match backend rules: length should be >3 and <50
  if (!title || title.length < 4 || title.length > 49) {
    throw new Error('Title must be between 4 and 49 characters')
  }

  await api.post(`tasks`, {
    json: {
      title,
      client_id,
    },
  })
}
