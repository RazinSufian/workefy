import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/jobs
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM jobs");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get jobs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    // Extract and validate required fields
    const {
      client_id,
      category_id,
      title,
      description,
      location,
      duration_type,
      duration_value,
      workers_needed,
      budget,
      job_type,
      payment_type,
      start_date,
      status = 'posted'
    } = data;

    // Validation
    if (!client_id || !category_id || !title || !description || !location || !duration_type || !budget || !job_type) {
      return NextResponse.json({
        message: "Missing required fields",
        required: ["client_id", "category_id", "title", "description", "location", "duration_type", "budget", "job_type"]
      }, { status: 400 });
    }

    const conn = await dbConnection();

    // Prepare values with proper data types and defaults
    const values = [
      parseInt(client_id),
      parseInt(category_id),
      title.trim(),
      description.trim(),
      location.trim(),
      duration_type,
      duration_value ? parseInt(duration_value) : null,
      workers_needed ? parseInt(workers_needed) : 1,
      parseFloat(budget),
      job_type,
      status,
      start_date && start_date.trim() ? start_date : null,
      payment_type || 'online'
    ];

    const [result] = await conn.query(`
      INSERT INTO jobs (
        client_id, 
        category_id, 
        title, 
        description, 
        location, 
        duration_type, 
        duration_value, 
        workers_needed, 
        budget, 
        job_type, 
        status, 
        start_date, 
        payment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, values);

    return NextResponse.json({
      message: "Job created successfully",
      jobId: result.insertId,
      result
    });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json({
      message: "Cannot create job",
      error: error.message
    }, { status: 500 });
  }
}