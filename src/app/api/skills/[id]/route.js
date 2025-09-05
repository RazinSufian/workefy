
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";

// ->> /api/skills/[id]
export async function PUT(request, { params }) {
  try {
    const { name } = await request.json();
    const conn = await dbConnection();
    await conn.query("UPDATE skills SET name = ? WHERE skill_id = ?", [name, params.id]);
    return NextResponse.json({ message: "Skill updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Cannot update skill" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const conn = await dbConnection();
    await conn.query("DELETE FROM skills WHERE skill_id = ?", [params.id]);
    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error(error);
    // Check for foreign key constraint error
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return NextResponse.json({ message: "Cannot delete skill because it is being used by workers." }, { status: 400 });
    }
    return NextResponse.json({ message: "Cannot delete skill" }, { status: 500 });
  }
}
