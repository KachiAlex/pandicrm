import { NextResponse } from "next/server";
import { notificationManager } from "../../../../lib/notifications";

export const runtime = "nodejs";

// GET /api/notifications/stats - Get notification statistics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get("userId");
    const workspaceId = searchParams.get("workspaceId");

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    const stats = await notificationManager.getNotificationStats(userId, workspaceId);
    const unreadCount = await notificationManager.getUnreadCount(userId, workspaceId);

    return NextResponse.json({ 
      stats: {
        ...stats,
        unreadCount,
      },
      userId,
      workspaceId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notification stats" },
      { status: 500 }
    );
  }
}
