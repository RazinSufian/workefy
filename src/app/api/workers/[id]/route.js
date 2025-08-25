
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/workers/[id]
export async function GET(request, { params } ) {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM workers WHERE worker_id = ?", [params.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get worker" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { skills, category_id, preferred_times, is_available } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("UPDATE workers SET skills = ?, category_id = ?, preferred_times = ?, is_available = ? WHERE worker_id = ?", [skills, category_id, preferred_times, is_available, params.id]);
    return NextResponse.json({ message: "Worker updated successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update worker" }, { status: 500 });
  }
}
