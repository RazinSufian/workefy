import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/jobs/[id]
export async function GET(request, { params } ) {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT j.*, c.name as client_name, c.created_at as client_created_at FROM jobs j JOIN users c ON j.client_id = c.user_id WHERE j.job_id = ?", [params.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get job" }, { status: 500 });
  }
}
