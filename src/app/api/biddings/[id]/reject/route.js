import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/bids/[id]/reject
export async function PUT(request, { params } ) {
  try {
    const conn = await dbConnection();
    await conn.query("UPDATE biddings SET status = 'rejected' WHERE bid_id = ?", [params.id]);
    return NextResponse.json({ message: "Bid rejected successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot reject bid" }, { status: 500 });
  }
}
