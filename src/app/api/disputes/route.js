
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/disputes
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM disputes");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get disputes" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { job_id, client_id, worker_id, reason, description, status, admin_notes, resolved_at } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO disputes (job_id, client_id, worker_id, reason, description, status, admin_notes, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [job_id, client_id, worker_id, reason, description, status, admin_notes, resolved_at]);
    return NextResponse.json({ message: "Dispute created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create dispute" }, { status: 500 });
  }
}
