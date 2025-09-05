
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/biddings
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');

  try {
    const conn = await dbConnection();
    let query = "SELECT b.*, u.name as worker_name, w.user_id FROM biddings b JOIN workers w ON b.worker_id = w.worker_id JOIN users u ON w.user_id = u.user_id";
    const params = [];

    if (jobId) {
      query += " WHERE b.job_id = ?";
      params.push(jobId);
    }

    const [rows] = await conn.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get biddings" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { job_id, worker_id, bid_amount, message, status } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO biddings (job_id, worker_id, bid_amount, message, status) VALUES (?, ?, ?, ?, ?)", [job_id, worker_id, bid_amount, message, status]);
    return NextResponse.json({ message: "Bidding created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create bidding" }, { status: 500 });
  }
}
