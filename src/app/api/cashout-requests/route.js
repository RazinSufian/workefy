
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/cashout-requests
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM cashout_requests");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get cashout requests" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { worker_id, amount, bank_name, bank_account, bank_routing, status, admin_notes, processed_by, processed_at } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO cashout_requests (worker_id, amount, bank_name, bank_account, bank_routing, status, admin_notes, processed_by, processed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [worker_id, amount, bank_name, bank_account, bank_routing, status, admin_notes, processed_by, processed_at]);
    return NextResponse.json({ message: "Cashout request created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create cashout request" }, { status: 500 });
  }
}
