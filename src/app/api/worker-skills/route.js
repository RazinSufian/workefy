
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/worker-skills
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM worker_skills");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get worker skills" }, { status: 500 });
  }
}
