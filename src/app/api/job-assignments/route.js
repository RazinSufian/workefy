import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/job-assignments
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('job_id');
  const workerId = searchParams.get('worker_id');
  const clientId = searchParams.get('client_id');
  const adminId = searchParams.get('admin_id');

  try {
    const conn = await dbConnection();
    let query = "SELECT * FROM job_assignments";
    const params = [];
    const conditions = [];

    if (jobId) {
      conditions.push("job_id = ?");
      params.push(jobId);
    }
    if (workerId) {
      conditions.push("worker_id = ?");
      params.push(workerId);
    }
    if (clientId) {
      conditions.push("assigned_by_client = ?");
      params.push(clientId);
    }
    if (adminId) {
      conditions.push("assigned_by_admin = ?");
      params.push(adminId);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [rows] = await conn.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get job assignments" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { job_id, worker_id, assigned_by_client, assigned_by_admin_user_id, status = 'assigned' } = await request.json();

    if (!job_id || !worker_id || (!assigned_by_client && !assigned_by_admin_user_id)) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const conn = await dbConnection();
    let assigned_by_admin_id = null;

    if (assigned_by_admin_user_id) {
      const [adminRows] = await conn.query('SELECT admin_id FROM admins WHERE user_id = ?', [assigned_by_admin_user_id]);
      if (adminRows.length > 0) {
        assigned_by_admin_id = adminRows[0].admin_id;
      }
    }

    const [result] = await conn.query(
      'INSERT INTO job_assignments (job_id, worker_id, assigned_by_client, assigned_by_admin, status) VALUES (?, ?, ?, ?, ?)',
      [job_id, worker_id, assigned_by_client, assigned_by_admin_id, status]
    );

    return NextResponse.json({
      message: "Job assignment created successfully",
      assignmentId: result.insertId,
    });
  } catch (error) {
    console.error("Job assignment creation error:", error);
    return NextResponse.json({ message: "Cannot create job assignment" }, { status: 500 });
  }
}

export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('job_id');
        const body = await request.json();

        if (!jobId) {
            return NextResponse.json({ message: "Job ID is required" }, { status: 400 });
        }

        const fields = Object.keys(body);
        const values = Object.values(body);

        if (fields.length === 0) {
            return NextResponse.json({ message: "No fields to update" }, { status: 400 });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');

        const conn = await dbConnection();
        await conn.query(`UPDATE job_assignments SET ${setClause} WHERE job_id = ?`, [...values, jobId]);

        return NextResponse.json({ message: "Job assignment updated successfully" });
    } catch (error) {
        console.error("Job assignment update error:", error);
        return NextResponse.json({ message: "Cannot update job assignment" }, { status: 500 });
    }
}
