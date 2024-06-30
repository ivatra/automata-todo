'use client'

import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { createTask } from '../http/create-task'
import { Button } from './ui/button'
import { Input } from './ui/input'

const NewTaskForm = () => {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { data: session } = useSession()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    e.currentTarget.reset()
    
    if (!session?.user) {
      throw new Error('Not authenticated')
    }

    startTransition(async () => {
      await createTask({
        title,
        client_id: (session.user as any).client_id
      })
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mx-auto flex w-full max-w-xl items-center space-x-2 rounded-lg border-2 border-muted p-4 has-[:focus-visible]:ring-2">
        <Input
          type="text"
          name="title"
          placeholder="Create a new task"
          required
          minLength={4}
          maxLength={49}
          className="focus-visible: rounded-none border-0 outline-none focus-visible:ring-0"
        />
        <Button type="submit" disabled={isPending}>
          <Plus className="size-4" />
          <span className="sr-only">Create new task</span>
        </Button>
      </div>
    </form>
  )
}
NewTaskForm.displayName = 'NewTaskForm'

export { NewTaskForm }
