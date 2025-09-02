import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/workers/[id]/verify
export async function PUT(request, { params }) {
  try {
    const { verification_status, rejection_reason } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("UPDATE workers SET verification_status = ?, rejection_reason = ? WHERE worker_id = ?", [verification_status, rejection_reason, params.id]);
    return NextResponse.json({ message: "Worker verification status updated successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update worker verification status" }, { status: 500 });
  }
}
