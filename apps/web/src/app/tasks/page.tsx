import dayjs from "dayjs";
import { headers } from "next/headers";
import { NewTaskForm } from "../../components/new-task-form";
import { Sidebar } from "../../components/sidebar";
import { TaskItem } from "../../components/task-item";
import { fetchTasks } from "../../http/fetch-tasks";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
type TStatus = "ALL" | "COMPLETED" | "PENDING";

export default async function TaskPage() {
  const session = await getServerSession(authOptions as any);

  if (!session) {
    return <meta httpEquiv="refresh" content="0;url=/login" />;
  }

  const headerItems = headers();
  const currentStatus = (headerItems.get("x-status") || "ALL") as TStatus;

  const { tasks } = await fetchTasks({
    status: currentStatus,
    client_id: (session as any)?.user.client_id,
  });

  return (
    <main className="space-y-8">
      <h2 className="text-center text-4xl font-bold">
        {dayjs().format("dddd DD,")}{" "}
        <span className="text-muted-foreground">{dayjs().format("MMMM")}</span>
      </h2>
      <NewTaskForm />
      <div className="grid grid-rows-[1fr_1fr] gap-8 divide-x-0 divide-y pt-8 sm:grid-cols-[12rem_1fr] sm:divide-x sm:divide-y-0">
        <Sidebar currentStatus={currentStatus} />
        <div className="w-full divide-y px-8 overflow-y-auto max-h-96">
          {!!tasks &&
            tasks.map((task) => <TaskItem key={task.id} task={task} />)}
        </div>
      </div>
    </main>
  );
}
