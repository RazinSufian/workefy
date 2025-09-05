
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

// ->> /api/users
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get('workerId');

  try {
    const conn = await dbConnection();
    if (workerId) {
      const [rows] = await conn.query("SELECT u.* FROM users u JOIN workers w ON u.user_id = w.user_id WHERE w.worker_id = ?", [workerId]);
      if (rows.length === 0) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    } else {
      const [rows] = await conn.query("SELECT * FROM users");
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get users" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, password, phone, address, role, agreement_signed } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO users (name, email, password, phone, address, role, agreement_signed) VALUES (?, ?, ?, ?, ?, ?, ?)", [name, email, hashedPassword, phone, address, role, agreement_signed]);
    return NextResponse.json({ message: "User created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create user" }, { status: 500 });
  }
}
