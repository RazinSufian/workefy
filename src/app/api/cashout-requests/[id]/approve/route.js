import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/cashout-requests/[id]/approve
export async function PUT(request, { params }) {
  const conn = await dbConnection();
  try {
    await conn.beginTransaction();

    // Get cashout request details
    const [cashoutRows] = await conn.query("SELECT * FROM cashout_requests WHERE cashout_id = ?", [params.id]);
    const cashout = cashoutRows[0];

    if (!cashout) {
      return NextResponse.json({ message: "Cashout request not found" }, { status: 404 });
    }

    // Get worker details
    const [workerRows] = await conn.query("SELECT * FROM workers WHERE worker_id = ?", [cashout.worker_id]);
    const worker = workerRows[0];

    if (!worker) {
      return NextResponse.json({ message: "Worker not found" }, { status: 404 });
    }

    // Check if worker has sufficient balance
    if (worker.balance < cashout.amount) {
      return NextResponse.json({ message: "Insufficient balance" }, { status: 400 });
    }

    // Deduct amount from worker's balance
    await conn.query("UPDATE workers SET balance = balance - ? WHERE worker_id = ?", [cashout.amount, cashout.worker_id]);

    // Update cashout request status to approved
    await conn.query(
      "UPDATE cashout_requests SET status = 'approved', processed_at = NOW() WHERE cashout_id = ?",
      [params.id]
    );

    await conn.commit();

    return NextResponse.json({
      message: "Cashout request approved successfully",
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return NextResponse.json(
      { message: "Cannot approve cashout request" },
      { status: 500 }
    );
  }
}