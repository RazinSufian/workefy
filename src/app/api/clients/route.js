
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/clients
export async function GET(requestt) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    const conn = await dbConnection();
    if (userId) {
      const [rows] = await conn.query("SELECT * FROM clients WHERE user_id = ?", [userId]);
      const clients = rows;
      if (clients.length === 0) {
        return NextResponse.json({ message: "Client not found" }, { status: 404 });
      }
      return NextResponse.json(clients[0]);
    } else {
      const [rows] = await conn.query("SELECT * FROM clients");
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get clients" }, { status: 500 });
  }
}

export async function POST(requestt) {
  try {
    const { user_id, safety_agreement_accepted, total_jobs_posted, rating } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO clients (user_id, safety_agreement_accepted, total_jobs_posted, rating) VALUES (?, ?, ?, ?)", [user_id, safety_agreement_accepted, total_jobs_posted, rating]);
    return NextResponse.json({ message: "Client created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create client" }, { status: 500 });
  }
}
