// app/api/upload/route.js
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
    try {
        const data = await request.formData();
        const file = data.get('file');
        const type = data.get('type') || 'general';

        if (!file) {
            return NextResponse.json({ error: "No file received" }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const fileExtension = path.extname(file.name);
        const filename = `${type}_${timestamp}${fileExtension}`;

        // Create the uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), "public", "uploads", type);
        await mkdir(uploadDir, { recursive: true });

        // Write the file
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return the public URL
        const url = `/uploads/${type}/${filename}`;

        return NextResponse.json({
            message: "File uploaded successfully",
            url: url,
            filename: filename
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}