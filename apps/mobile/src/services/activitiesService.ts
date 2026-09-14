import type { Activity, CreateActivityDto } from "@long-run/shared";
import { api } from "./api";

export function createActivity(dto: CreateActivityDto) {
  return api.post<Activity>("/activities", dto);
}

export function listActivities() {
  return api.get<Activity[]>("/activities");
}

export function getActivity(id: string) {
  return api.get<Activity>(`/activities/${id}`);
}

export function deleteActivity(id: string) {
  return api.delete<void>(`/activities/${id}`);
}
