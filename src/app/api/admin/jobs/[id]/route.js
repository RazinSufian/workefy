import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/admin/jobs/[id]
export async function GET(request, { params }) {
  try {
    // Await params to fix Next.js async params issue
    const { id } = await params;
    const conn = await dbConnection();

    const [rows] = await conn.query(`
      SELECT j.*, c.name as client_name, c.created_at as client_created_at 
      FROM jobs j 
      JOIN clients cl ON j.client_id = cl.client_id
      JOIN users c ON cl.user_id = c.user_id 
      WHERE j.job_id = ?
    `, [id]);

    // Check if job exists
    if (rows.length === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Return array format for admin compatibility
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get job" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params to fix Next.js async params issue
    const { id } = await params;
    const body = await request.json();
    const conn = await dbConnection();

    const fields = Object.keys(body);
    const values = Object.values(body);

    if (fields.length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await conn.query(`UPDATE jobs SET ${setClause} WHERE job_id = ?`, [...values, id]);

    // Return updated job in array format for admin compatibility
    const [rows] = await conn.query(`
      SELECT j.*, c.name as client_name, c.created_at as client_created_at 
      FROM jobs j 
      JOIN clients cl ON j.client_id = cl.client_id
      JOIN users c ON cl.user_id = c.user_id 
      WHERE j.job_id = ?
    `, [id]);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update job" }, { status: 500 });
  }
}