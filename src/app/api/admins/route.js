
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/admins
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM admins");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get admins" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user_id, permissions, commission_percentage } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO admins (user_id, permissions, commission_percentage) VALUES (?, ?, ?)", [user_id, permissions, commission_percentage]);
    return NextResponse.json({ message: "Admin created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create admin" }, { status: 500 });
  }
}
