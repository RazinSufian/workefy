
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/reviews
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM reviews");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get reviews" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { job_id, reviewer_id, reviewee_id, rating, comment } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)", [job_id, reviewer_id, reviewee_id, rating, comment]);
    return NextResponse.json({ message: "Review created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create review" }, { status: 500 });
  }
}
