
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/workers
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    const conn = await dbConnection();
    if (userId) {
      const [rows] = await conn.query("SELECT * FROM workers WHERE user_id = ?", [userId]);
      const workers = rows;
      if (workers.length === 0) {
        return NextResponse.json({ message: "Worker not found" }, { status: 404 });
      }
      return NextResponse.json(workers[0]);
    } else {
      const [rows] = await conn.query("SELECT * FROM workers");
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get workers" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user_id, skills, category_id, nid_number, nid_card_url, verification_status, preferred_times, balance, rating, total_jobs, is_available } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO workers (user_id, skills, category_id, nid_number, nid_card_url, verification_status, preferred_times, balance, rating, total_jobs, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user_id, skills, category_id, nid_number, nid_card_url, verification_status, preferred_times, balance, rating, total_jobs, is_available]);
    return NextResponse.json({ message: "Worker created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create worker" }, { status: 500 });
  }
}
