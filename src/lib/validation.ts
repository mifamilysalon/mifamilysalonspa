import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const pinLoginSchema = z.object({
  staffId: z.number().int().positive(),
  pin: z.string().min(4).max(6),
});

export const bookAppointmentSchema = z
  .object({
    serviceId: z.number().int().positive(),
    staffId: z.number().int().positive().optional().nullable(),
    clientName: z.string().min(2).max(120),
    clientEmail: z.string().email().optional().or(z.literal("")),
    clientPhone: z.string().min(7).max(30),
    startDatetime: z.string().min(10).optional(),
    notes: z.string().max(1000).optional(),
    smsOptIn: z.boolean().optional(),
    preferredOnly: z.boolean().optional(),
    mode: z.enum(["appointment", "walk_in"]).optional(),
    arriveInMinutes: z.number().int().min(0).max(180).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.mode !== "walk_in" && !val.startDatetime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "startDatetime is required for appointments",
        path: ["startDatetime"],
      });
    }
  });

export const recordWalkInSchema = z.object({
  serviceId: z.number().int().positive(),
  staffId: z.number().int().positive().optional().nullable(),
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().min(7).max(30),
  /** ISO start; omit to use now / arriveInMinutes */
  startDatetime: z.string().min(10).optional(),
  arriveInMinutes: z.number().int().min(0).max(180).optional(),
  notes: z.string().max(1000).optional(),
  status: z.enum(["confirmed", "in_progress"]).optional(),
  smsOptIn: z.boolean().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .optional(),
  notes: z.string().max(1000).optional(),
  /** Reassign / transfer; null unassigns to the open pool */
  staffId: z.number().int().positive().nullable().optional(),
  claim: z.boolean().optional(),
  claimAndConfirm: z.boolean().optional(),
  startDatetime: z.string().min(10).optional(),
  reason: z.string().max(500).optional(),
  force: z.boolean().optional(),
}).refine(
  (v) =>
    v.status !== undefined ||
    v.notes !== undefined ||
    v.staffId !== undefined ||
    v.claim ||
    v.claimAndConfirm ||
    v.startDatetime !== undefined,
  { message: "Provide at least one change" },
);

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type RecordWalkInInput = z.infer<typeof recordWalkInSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentStatusSchema>;
