import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/bids/[id]/accept
export async function PUT(request, { params } ) {
  try {
    const conn = await dbConnection();
    const [bid] = await conn.query("SELECT * FROM biddings WHERE bid_id = ?", [params.id]);

    if (!bid.length) {
      return NextResponse.json({ message: "Bid not found" }, { status: 404 });
    }

    const { job_id, worker_id, bid_amount } = bid[0];

    const [job] = await conn.query("SELECT * FROM jobs WHERE job_id = ?", [job_id]);
    const client_id = job[0].client_id;

    // Update bid status
    await conn.query("UPDATE biddings SET status = 'accepted' WHERE bid_id = ?", [params.id]);

    // Update job status
    await conn.query("UPDATE jobs SET status = 'assigned' WHERE job_id = ?", [job_id]);

    // Assign worker to job
    await conn.query("INSERT INTO job_assignments (job_id, worker_id, assigned_by_client) VALUES (?, ?, ?)", [job_id, worker_id, client_id]);

    // Add money to worker's balance
    await conn.query("UPDATE workers SET balance = balance + ? WHERE worker_id = ?", [bid_amount, worker_id]);

    return NextResponse.json({ message: "Bid accepted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot accept bid" }, { status: 500 });
  }
}
