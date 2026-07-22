import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const pinLoginSchema = z.object({
  staffId: z.number().int().positive(),
  pin: z.string().min(4).max(6),
});

export const bookAppointmentSchema = z.object({
  serviceId: z.number().int().positive(),
  staffId: z.number().int().positive().optional().nullable(),
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().min(7).max(30),
  startDatetime: z.string().min(10),
  notes: z.string().max(1000).optional(),
  smsOptIn: z.boolean().optional(),
  preferredOnly: z.boolean().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ]),
  notes: z.string().max(1000).optional(),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
