
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/notifications
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM notifications");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get notifications" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user_id, type, title, message, is_read } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO notifications (user_id, type, title, message, is_read) VALUES (?, ?, ?, ?, ?)", [user_id, type, title, message, is_read]);
    return NextResponse.json({ message: "Notification created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create notification" }, { status: 500 });
  }
}
