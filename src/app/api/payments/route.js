
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/payments
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM payments");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get payments" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { job_id, client_id, worker_id, total_amount, admin_commission, worker_amount, commission_percentage, payment_type, status, transaction_id } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO payments (job_id, client_id, worker_id, total_amount, admin_commission, worker_amount, commission_percentage, payment_type, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [job_id, client_id, worker_id, total_amount, admin_commission, worker_amount, commission_percentage, payment_type, status, transaction_id]);
    return NextResponse.json({ message: "Payment created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create payment" }, { status: 500 });
  }
}
