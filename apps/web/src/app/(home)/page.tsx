import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '../api/auth/[...nextauth]/route'

export default async function HomePage() {
  const session = await getServerSession(authOptions as any)

  if (!session) {
    // immediately redirect on the server when there's no session
    redirect('/login')
  }

  // if authenticated, send user to tasks
  redirect('/tasks')
}
