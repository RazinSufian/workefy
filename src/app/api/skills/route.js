
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/skills
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM skills ORDER BY name");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get skills" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO skills (name) VALUES (?)", [name]);
    return NextResponse.json({ message: "Skill created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create skill" }, { status: 500 });
  }
}
