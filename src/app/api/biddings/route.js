
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/biddings
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM biddings");
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
