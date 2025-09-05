
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/workers/[id]/balance
export async function PUT(request, { params }) {
  try {
    const { balance } = await request.json();
    const conn = await dbConnection();
    // Increment the worker's balance
    await conn.query("UPDATE workers SET balance = balance + ? WHERE worker_id = ?", [balance, params.id]);
    return NextResponse.json({ message: "Worker balance updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update worker balance" }, { status: 500 });
  }
}
