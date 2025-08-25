
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/users/[id]
export async function GET(request, { params }) {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM users WHERE user_id = ?", [params.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get user" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { name, email, phone, address } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE user_id = ?", [name, email, phone, address, params.id]);
    return NextResponse.json({ message: "User updated successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update user" }, { status: 500 });
  }
}
