'use client';

import { useQuery, useMutation } from "convex/react";
// @ts-ignore - Convex not initialized yet
import { api } from "../../convex/_generated/api";

export function useAlerts(userId: string) {
    const alerts = useQuery(api.alerts.getUserAlerts);
    return alerts || [];
}

export function useActiveAlerts(userId: string) {
    const alerts = useAlerts(userId);
    return alerts.filter((a: any) => a.status === 'active');
}

export function useActiveAlertsCount(userId: string) {
    const alerts = useActiveAlerts(userId);
    return alerts.length;
}

export function useCreateAlert() {
    return useMutation(api.alerts.createAlert);
}

export function useUpdateAlertStatus() {
    return useMutation(api.alerts.updateAlertStatus);
}

export function useDeleteAlert() {
    return useMutation(api.alerts.deleteAlert);
}

export function useToggleAlertStatus() {
    return useMutation(api.alerts.toggleAlertStatus);
}
