
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/categories
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const conn = await dbConnection();
    if (id) {
      const [rows] = await conn.query("SELECT * FROM categories WHERE category_id = ?", [id]);
      return NextResponse.json(rows[0]);
    } else {
      const [rows] = await conn.query("SELECT * FROM categories");
      return NextResponse.json(rows);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get categories" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const conn = await dbConnection();
    const [result] = await conn.query("INSERT INTO categories (name) VALUES (?)", [name]);
    return NextResponse.json({ message: "Category created successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot create category" }, { status: 500 });
  }
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { name } = await request.json();

  try {
    const conn = await dbConnection();
    const [result] = await conn.query("UPDATE categories SET name = ? WHERE category_id = ?", [name, id]);
    return NextResponse.json({ message: "Category updated successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update category" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const conn = await dbConnection();
    const [result] = await conn.query("DELETE FROM categories WHERE category_id = ?", [id]);
    return NextResponse.json({ message: "Category deleted successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot delete category" }, { status: 500 });
  }
}
