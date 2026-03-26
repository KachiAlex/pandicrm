import { NextResponse } from "next/server";
import { notificationManager } from "../../../../lib/notifications";

export const runtime = "nodejs";

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { userId, workspaceId } = body;

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    const markedCount = await notificationManager.markAllAsRead(userId);

    return NextResponse.json({ 
      message: "All notifications marked as read",
      markedCount,
      userId,
      workspaceId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
