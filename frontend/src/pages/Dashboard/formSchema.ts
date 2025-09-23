import { z } from "zod";

export const dashboardColumnSchema = z.object({
  component: z.string(), // ex: "CardEntry", "ChartMonthlyReceive"
  width: z.number().min(1).max(12), // grid system, misalnya max 12 kolom
});

export const dashboardRowSchema = z.object({
  columns: z.array(dashboardColumnSchema).min(1),
});

export const dashboardLayoutSchema = z.object({
  rows: z.array(dashboardRowSchema).min(1),
});

export type DashboardLayoutFormValues = z.infer<typeof dashboardLayoutSchema>;
