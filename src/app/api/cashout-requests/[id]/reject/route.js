
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/cashout-requests/[id]/reject
export async function PUT(request, { params }) {
  const conn = await dbConnection();
  try {
    await conn.beginTransaction();

    const [requestRows] = await conn.query("SELECT * FROM cashout_requests WHERE cashout_id = ?", [params.id]);
    if (requestRows.length === 0) {
      return NextResponse.json({ message: "Cashout request not found" }, { status: 404 });
    }
    const request = requestRows[0];

    if (request.status !== 'pending') {
        return NextResponse.json({ message: "Request has already been processed"}, { status: 400 });
    }

    // Update the request status to 'rejected'
    await conn.query("UPDATE cashout_requests SET status = 'rejected', processed_at = NOW() WHERE cashout_id = ?", [params.id]);

    // Return the amount to the worker's balance
    await conn.query("UPDATE workers SET balance = balance + ? WHERE worker_id = ?", [request.amount, request.worker_id]);

    await conn.commit();

    return NextResponse.json({ message: "Cashout request rejected successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return NextResponse.json({ message: "Cannot reject cashout request" }, { status: 500 });
  }
}
