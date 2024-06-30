"use server"

import { HTTPError } from 'ky'
import { z } from 'zod'

import { createTask } from '../../http/create-task'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { deleteTask } from '../../http/delete-task'
import { toggleTaskCompleted } from '../../http/toggle-task-completed'

export const toggleTaskCompletedAction = async ({
  taskId,
}: {
  taskId: string
}) => {
  try {
    await toggleTaskCompleted({ taskId })
    return true
  } catch (error) {
    if (error instanceof HTTPError) {
      console.log(error)
      const { message } = await error.response.json()
      console.log(message)
      // return { success: false, message, errors: null }
    }
    console.error(error)
    return false
  }
}

export const deleteTaskAction = async ({ taskId }: { taskId: string }) => {
  try {
    await deleteTask({ taskId })
    return true
  } catch (error) {
    if (error instanceof HTTPError) {
      console.log(error)
      const { message } = await error.response.json()
      console.log(message)
      // return { success: false, message, errors: null }
    }
    console.error(error)
    return false
  }
}

const createTaskSchema = z.object({
  title: z.string(),
})

export const createTaskAction = async (data: FormData) => {
  const formDataValidationResult = createTaskSchema.safeParse(
    Object.fromEntries(data),
  )

  if (!formDataValidationResult.success) {
    console.log(formDataValidationResult.error.issues)
    return false
  }

  const { title } = formDataValidationResult.data

  try {
    // try to get client_id from server session
    const session = await getServerSession(authOptions as any)
  const client_id = (session as any)?.user?.client_id

    if (!client_id) {
      throw new Error('Missing client_id in session')
    }

    await createTask({ title, client_id })
    return true
  } catch (error) {
    if (error instanceof HTTPError) {
      console.log(error)
      const { message } = await error.response.json()
      console.log(message)
      // return { success: false, message, errors: null }
    }
    console.error(error)
    return false
  }
}
