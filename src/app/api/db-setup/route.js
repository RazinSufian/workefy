
import { NextResponse } from "next/server";
import dbConnection from "@/lib/dbConnect";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const conn = await dbConnection();
    const sqlFilePath = path.join(process.cwd(), "src", "Model", "model.sql");
    const sql = await fs.readFile(sqlFilePath, "utf-8");
    const queries = sql.split(";").filter(query => query.trim() !== "");
    for (const query of queries) {
      await conn.query(query);
    }
    return NextResponse.json({ message: "Database setup complete." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Database setup failed." }, { status: 500 });
  }
}
