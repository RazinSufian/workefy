
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/admin/revenue
export async function GET(request) {
  const conn = await dbConnection();
  try {
    const [revenueRows] = await conn.query(`
      SELECT 
        ar.revenue_id,
        ar.job_id,
        j.title AS job_title,
        ar.commission_amount,
        ar.created_at
      FROM admin_revenue ar
      JOIN jobs j ON ar.job_id = j.job_id
      ORDER BY ar.created_at DESC
    `);

    return NextResponse.json(revenueRows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot fetch revenue data" }, { status: 500 });
  }
}
