
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/jobs
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM jobs");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get jobs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { client_id, category_id, title, description, location, duration_type, duration_value, workers_needed, budget, job_type, status, start_date, payment_type } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO jobs (client_id, category_id, title, description, location, duration_type, duration_value, workers_needed, budget, job_type, status, start_date, payment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [client_id, category_id, title, description, location, duration_type, duration_value, workers_needed, budget, job_type, status, start_date, payment_type]);
    return NextResponse.json({ message: "Job created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create job" }, { status: 500 });
  }
}
