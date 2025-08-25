
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/categories
export async function GET() {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM categories");
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get categories" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO categories (name, description) VALUES (?, ?)", [name, description]);
    return NextResponse.json({ message: "Category created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create category" }, { status: 500 });
  }
}
