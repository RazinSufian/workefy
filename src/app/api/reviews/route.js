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
    
    // Insert the new review
    const [result] = await conn.query("INSERT INTO reviews (job_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)", [job_id, reviewer_id, reviewee_id, rating, comment]);

    // Calculate and update the average rating
    const [reviews] = await conn.query("SELECT rating FROM reviews WHERE reviewee_id = ?", [reviewee_id]);
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Get the reviewee's role
    const [userRows] = await conn.query("SELECT role FROM users WHERE user_id = ?", [reviewee_id]);
    const userRole = userRows[0]?.role;

    if (userRole === 'worker') {
      // Find worker_id from user_id (reviewee_id)
      const [worker] = await conn.query("SELECT worker_id FROM workers WHERE user_id = ?", [reviewee_id]);
      if (worker.length > 0) {
        const worker_id = worker[0].worker_id;
        await conn.query("UPDATE workers SET rating = ? WHERE worker_id = ?", [averageRating.toFixed(2), worker_id]);
      }
    } else if (userRole === 'client') {
      // Find client_id from user_id (reviewee_id)
      const [client] = await conn.query("SELECT client_id FROM clients WHERE user_id = ?", [reviewee_id]);
      if (client.length > 0) {
        const client_id = client[0].client_id;
        await conn.query("UPDATE clients SET rating = ? WHERE client_id = ?", [averageRating.toFixed(2), client_id]);
      }
    }

    return NextResponse.json({ message: "Review created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create review" }, { status: 500 });
  }
}