import { api } from "../lib/ky";

type FetchTasksRequest = {
  status: "ALL" | "COMPLETED" | "PENDING";
  client_id: string;
};

type FetchTasksResponse = {
  tasks: {
    id: string;
    title: string;
    createdAt: string;
    completedAt?: string;
  }[];
};

export async function fetchTasks({ status, client_id }: FetchTasksRequest) {
  console.log("Fetching tasks for client_id:", client_id);
  const params = new URLSearchParams({ status, client_id });
  const result = await api
    .get(`tasks?${params.toString()}`)
    .json<FetchTasksResponse>();
  return result;
}
