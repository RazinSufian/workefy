
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";
import bcrypt from "bcryptjs";

// ->> /api/users
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM users");
    return NextResponse.json(rows);
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
