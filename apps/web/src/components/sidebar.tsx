"use client"

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

type SidebarProps = {
  currentStatus: 'ALL' | 'COMPLETED' | 'PENDING'
}

const Sidebar = ({ currentStatus }: SidebarProps) => {
  const { data: session } = useSession()
  const initials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US'

  return (
    <aside className="flex flex-col gap-4">
      <Avatar className="mx-auto size-16">
        {/* show GitHub avatar when available, otherwise render initials */}
        <AvatarImage src={session?.user?.image ?? undefined} />
        <AvatarFallback className="bg-emerald-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <nav className="flex flex-col gap-2">
        <Button
          asChild
          variant="link"
          data-current={currentStatus === 'ALL'}
          className="justify-start text-lg font-normal data-[current=true]:font-bold"
        >
          <Link href="tasks?status=ALL">All</Link>
        </Button>
        <Button
          asChild
          variant="link"
          data-current={currentStatus === 'PENDING'}
          className="justify-start text-lg font-normal data-[current=true]:font-bold"
        >
          <Link href="tasks?status=PENDING">Pending</Link>
        </Button>
        <Button
          asChild
          variant="link"
          data-current={currentStatus === 'COMPLETED'}
          className="justify-start text-lg font-normal data-[current=true]:font-bold"
        >
          <Link href="tasks?status=COMPLETED">Completed</Link>
        </Button>
        <Separator />
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut />
          Log-out
        </Button>
      </nav>
    </aside>
  )
}
Sidebar.displayName = 'Sidebar'

export { Sidebar }
