import { NextResponse } from "next/server";
import { notificationManager } from "../../../lib/notifications";

export const runtime = "nodejs";

// GET /api/notifications - Get user notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get("userId");
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeRead = searchParams.get("includeRead") === "true";

    if (!userId || !workspaceId) {
      return NextResponse.json(
        { error: "userId and workspaceId are required" },
        { status: 400 }
      );
    }

    const notifications = await notificationManager.getUserNotifications(
      userId,
      workspaceId,
      limit,
      offset,
      includeRead
    );

    return NextResponse.json({ 
      notifications,
      total: notifications.length,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a notification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const notification = await notificationManager.create({
      userId: body.userId,
      workspaceId: body.workspaceId,
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data,
      expiresAt: body.expiresAt,
    });

    return NextResponse.json({ 
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create notification" },
      { status: 500 }
    );
  }
}
