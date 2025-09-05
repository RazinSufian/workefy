import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/jobs/[id]/complete
export async function PUT(request, { params }) {
  const conn = await dbConnection();
  try {
    // Await params to fix Next.js async params issue
    const { id } = await params;

    await conn.beginTransaction();

    // Get job details
    const [jobRows] = await conn.query("SELECT * FROM jobs WHERE job_id = ?", [id]);
    const job = jobRows[0];

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Update job status to completed
    await conn.query("UPDATE jobs SET status = 'completed' WHERE job_id = ?", [id]);

    // Get the first admin (or create a default admin if none exists)
    const [adminRows] = await conn.query("SELECT admin_id FROM admins LIMIT 1");
    let adminId;

    if (adminRows.length === 0) {
      // Create a default admin if none exists
      // First, create a user for the admin
      const [userResult] = await conn.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ['System Admin', 'admin@workhub.com', 'hashed_password', 'admin']
      );

      // Then create the admin record
      const [adminResult] = await conn.query(
        "INSERT INTO admins (user_id, permissions, commission_percentage) VALUES (?, ?, ?)",
        [userResult.insertId, 'full_access', 15.00]
      );

      adminId = adminResult.insertId;
    } else {
      adminId = adminRows[0].admin_id;
    }

    // Calculate and add admin commission
    const commission = job.budget * 0.15;
    await conn.query(
      "INSERT INTO admin_revenue (admin_id, job_id, commission_amount) VALUES (?, ?, ?)",
      [adminId, id, commission]
    );

    // Handle commission for manual payments
    if (job.payment_type === 'manual') {
      // Find the assigned worker
      const [assignmentRows] = await conn.query("SELECT * FROM job_assignments WHERE job_id = ?", [id]);
      const assignment = assignmentRows[0];

      if (assignment) {
        const workerId = assignment.worker_id;

        // Deduct commission from worker's balance
        await conn.query("UPDATE workers SET balance = balance - ? WHERE worker_id = ?", [commission, workerId]);
      }
    }

    if (job.payment_type === 'online') {
      // Find the assigned worker
      const [assignmentRows] = await conn.query("SELECT * FROM job_assignments WHERE job_id = ?", [id]);
      const assignment = assignmentRows[0];

      if (assignment) {
        const workerId = assignment.worker_id;

        // Add budget to worker's balance (minus commission for online payments)
        const workerAmount = job.budget - commission;
        await conn.query("UPDATE workers SET balance = balance + ? WHERE worker_id = ?", [workerAmount, workerId]);
      }
    }

    await conn.commit();

    return NextResponse.json({ message: "Job marked as completed successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    return NextResponse.json({ message: "Cannot mark job as completed" }, { status: 500 });
  }
}