
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/workers/[id]/skills
export async function GET(request, { params }) {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT s.skill_id, s.name FROM worker_skills ws JOIN skills s ON ws.skill_id = s.skill_id WHERE ws.worker_id = ?", [params.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get worker skills" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const conn = await dbConnection();
  try {
    const { skill_ids } = await request.json();
    
    await conn.beginTransaction();

    // Delete old skills
    await conn.query("DELETE FROM worker_skills WHERE worker_id = ?", [params.id]);

    // Insert new skills
    if (skill_ids && skill_ids.length > 0) {
      const values = skill_ids.map(skill_id => [params.id, skill_id]);
      await conn.query("INSERT INTO worker_skills (worker_id, skill_id) VALUES ?", [values]);
    }

    await conn.commit();

    return NextResponse.json({ message: "Worker skills updated successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return NextResponse.json({ message: "Cannot update worker skills" }, { status: 500 });
  }
}
