import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceAccess, unauthorized, serverError, notFound } from "@/lib/api-auth";
import { updateContactCategorySchema, validateBody } from "@/lib/validations";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const category = await prisma.contactCategory.findUnique({ where: { id } });
    if (!category) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(category.workspaceId, userId))) return unauthorized();

    const body = await req.json();
    const validation = validateBody(updateContactCategorySchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { name, color } = validation.data;

    if (name) {
      const existing = await prisma.contactCategory.findFirst({
        where: { workspaceId: category.workspaceId, name: { equals: name, mode: "insensitive" }, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
      }
    }

    const updated = await prisma.contactCategory.update({
      where: { id },
      data: { name, color },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(req);
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const category = await prisma.contactCategory.findUnique({ where: { id } });
    if (!category) return notFound();

    const userId = (session as any).user.id;
    if (!(await requireWorkspaceAccess(category.workspaceId, userId))) return unauthorized();

    // Remove category id from all contacts before deleting the category
    await prisma.$executeRaw`UPDATE "contacts" SET "category_ids" = array_remove("category_ids", ${id}) WHERE ${id} = ANY("category_ids")`;

    await prisma.contactCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
