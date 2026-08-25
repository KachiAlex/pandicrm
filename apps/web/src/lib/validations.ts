import { z } from "zod";

export const createAccountSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  domain: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  domain: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.string().max(50).optional(),
  website: z.string().url().max(500).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
});

export const createContactSchema = z.object({
  workspaceId: z.string().min(1),
  accountId: z.string().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  linkedin: z.string().url().max(500).optional().or(z.literal("")),
});

export const updateContactSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  linkedin: z.string().url().max(500).optional().or(z.literal("")),
  accountId: z.string().optional(),
});

export const createDealSchema = z.object({
  workspaceId: z.string().min(1),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  name: z.string().min(1).max(200),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  probability: z.number().min(0).max(100).optional(),
  closeDate: z.string().optional(),
  description: z.string().max(2000).optional(),
});

export const updateDealSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  probability: z.number().min(0).max(100).optional(),
  closeDate: z.string().optional(),
  description: z.string().max(2000).optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
});

export const createTaskSchema = z.object({
  workspaceId: z.string().min(1),
  assigneeId: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
});

export const createNoteSchema = z.object({
  workspaceId: z.string().min(1),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  type: z.enum(["call", "email", "meeting", "general", "ai"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isShared: z.boolean().optional(),
  aiSummary: z.string().max(2000).optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  type: z.enum(["call", "email", "meeting", "general", "ai"]).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isShared: z.boolean().optional(),
  aiSummary: z.string().max(2000).optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateUserSchema = z.object({
  name: z.string().max(200).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  role: z.string().max(100).optional(),
});

export const importContactsSchema = z.object({
  workspaceId: z.string().min(1),
  csvText: z.string().min(1),
});

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError ? `${firstError.path.join(".")}: ${firstError.message}` : "Validation failed" };
}
