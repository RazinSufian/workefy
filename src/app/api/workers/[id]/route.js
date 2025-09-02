
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";
import { writeFile } from 'fs/promises';
import path from 'path';

// ->> /api/workers/[id]
export async function GET(request, { params } ) {
  try {
    const conn = await dbConnection();
    const [rows] = await conn.query("SELECT * FROM workers WHERE worker_id = ?", [params.id]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot get worker" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.formData();
    const name = data.get('name');
    const phone = data.get('phone');
    const address = data.get('address');
    const skills = data.get('skills');
    const category_id = data.get('category_id');
    const preferred_times = data.get('preferred_times');
    const is_available = data.get('is_available');
    const nidImage = data.get('nidImage');

    let nidCardUrl = null;

    if (nidImage) {
      const bytes = await nidImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(process.cwd(), 'public', 'uploads', nidImage.name);
      await writeFile(filePath, buffer);
      nidCardUrl = `/uploads/${nidImage.name}`;
    }

    const conn = await dbConnection();
    const [result] = await conn.query("UPDATE workers SET skills = ?, category_id = ?, preferred_times = ?, is_available = ?, nid_card_url = ? WHERE worker_id = ?", [skills, category_id, preferred_times, is_available, nidCardUrl, params.id]);
    return NextResponse.json({ message: "Worker updated successfully", result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update worker" }, { status: 500 });
  }
}
