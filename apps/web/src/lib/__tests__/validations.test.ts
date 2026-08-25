import { describe, it, expect } from "vitest";
import {
  createAccountSchema,
  updateAccountSchema,
  createContactSchema,
  updateContactSchema,
  createDealSchema,
  updateDealSchema,
  createTaskSchema,
  updateTaskSchema,
  createNoteSchema,
  updateNoteSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  updateUserSchema,
  changePasswordSchema,
  registerSchema,
  importContactsSchema,
  validateBody,
} from "@/lib/validations";

describe("createAccountSchema", () => {
  it("validates a valid account", () => {
    const result = createAccountSchema.safeParse({
      workspaceId: "ws-1",
      name: "Acme Corp",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing workspaceId", () => {
    const result = createAccountSchema.safeParse({ name: "Acme" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createAccountSchema.safeParse({ workspaceId: "ws-1" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 200 chars", () => {
    const result = createAccountSchema.safeParse({
      workspaceId: "ws-1",
      name: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateAccountSchema", () => {
  it("accepts partial updates", () => {
    const result = updateAccountSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateAccountSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("createContactSchema", () => {
  it("validates a valid contact", () => {
    const result = createContactSchema.safeParse({
      workspaceId: "ws-1",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing firstName", () => {
    const result = createContactSchema.safeParse({
      workspaceId: "ws-1",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createContactSchema.safeParse({
      workspaceId: "ws-1",
      firstName: "John",
      lastName: "Doe",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty string email", () => {
    const result = createContactSchema.safeParse({
      workspaceId: "ws-1",
      firstName: "John",
      lastName: "Doe",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateContactSchema", () => {
  it("accepts partial update", () => {
    const result = updateContactSchema.safeParse({ firstName: "Jane" });
    expect(result.success).toBe(true);
  });
});

describe("createDealSchema", () => {
  it("validates a valid deal", () => {
    const result = createDealSchema.safeParse({
      workspaceId: "ws-1",
      name: "Big Deal",
      stage: "qualified",
      value: 50000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid stage", () => {
    const result = createDealSchema.safeParse({
      workspaceId: "ws-1",
      name: "Deal",
      stage: "invalid_stage",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative value", () => {
    const result = createDealSchema.safeParse({
      workspaceId: "ws-1",
      name: "Deal",
      value: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects probability > 100", () => {
    const result = createDealSchema.safeParse({
      workspaceId: "ws-1",
      name: "Deal",
      probability: 150,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateDealSchema", () => {
  it("accepts partial update with valid stage", () => {
    const result = updateDealSchema.safeParse({ stage: "won" });
    expect(result.success).toBe(true);
  });
});

describe("createTaskSchema", () => {
  it("validates a valid task", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-1",
      title: "Follow up",
      priority: "high",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid priority", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-1",
      title: "Task",
      priority: "critical",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createTaskSchema.safeParse({
      workspaceId: "ws-1",
      title: "Task",
      status: "pending",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("accepts partial update", () => {
    const result = updateTaskSchema.safeParse({ status: "done" });
    expect(result.success).toBe(true);
  });
});

describe("createNoteSchema", () => {
  it("validates a valid note", () => {
    const result = createNoteSchema.safeParse({
      workspaceId: "ws-1",
      title: "Meeting notes",
      content: "Discussed Q4 strategy",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing content", () => {
    const result = createNoteSchema.safeParse({
      workspaceId: "ws-1",
      title: "Notes",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding 10000 chars", () => {
    const result = createNoteSchema.safeParse({
      workspaceId: "ws-1",
      title: "Notes",
      content: "a".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many tags", () => {
    const result = createNoteSchema.safeParse({
      workspaceId: "ws-1",
      title: "Notes",
      content: "content",
      tags: Array(21).fill("tag"),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateNoteSchema", () => {
  it("accepts partial update", () => {
    const result = updateNoteSchema.safeParse({ title: "Updated" });
    expect(result.success).toBe(true);
  });
});

describe("createWorkspaceSchema", () => {
  it("validates a valid workspace name", () => {
    const result = createWorkspaceSchema.safeParse({ name: "My Workspace" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createWorkspaceSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

describe("updateWorkspaceSchema", () => {
  it("validates a valid name", () => {
    const result = updateWorkspaceSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });
});

describe("updateUserSchema", () => {
  it("accepts partial update", () => {
    const result = updateUserSchema.safeParse({ firstName: "Jane" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  it("validates valid passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old123",
      newPassword: "new123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old123",
      newPassword: "abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing currentPassword", () => {
    const result = changePasswordSchema.safeParse({ newPassword: "newpass123" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates a valid registration", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "secure123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-email",
      password: "secure123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "abc",
    });
    expect(result.success).toBe(false);
  });
});

describe("importContactsSchema", () => {
  it("validates valid input", () => {
    const result = importContactsSchema.safeParse({
      workspaceId: "ws-1",
      csvText: "first,last\nJohn,Doe",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing csvText", () => {
    const result = importContactsSchema.safeParse({ workspaceId: "ws-1" });
    expect(result.success).toBe(false);
  });
});

describe("validateBody helper", () => {
  it("returns success with data for valid input", () => {
    const result = validateBody(createWorkspaceSchema, { name: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test");
    }
  });

  it("returns error message for invalid input", () => {
    const result = validateBody(createWorkspaceSchema, {});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("name");
    }
  });
});
