
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/clients/[id]
export async function GET(request, { params }) {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM clients WHERE client_id = ?", [params.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get client" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { safety_agreement_accepted } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("UPDATE clients SET safety_agreement_accepted = ? WHERE client_id = ?", [safety_agreement_accepted, params.id]);
    return NextResponse.json({ message: "Client updated successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update client" }, { status: 500 });
  }
}
