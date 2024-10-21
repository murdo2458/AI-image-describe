import { classifyImage } from "@/app/lib/classifier";
import { NextResponse, NextRequest } from "next/server";

// Set the runtime to edge for best performance
export const runtime = "edge";

// add a listener to POST requests
export async function POST(request: NextRequest) {
    // read our file from request data
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
        return NextResponse.json(
            { message: "File not present in body" },
            { status: 400, statusText: "Bad Request" }
        );
    }

    // call our classify function and get the response
    const stream = await classifyImage(file);

    // Read the entire stream and concatenate it into a single string
    const reader = stream.getReader();
    let result = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
    }

    // Remove any "data: " prefixes, newlines, and "0:" prefixes
    result = result.replace(/^data: |^0:/gm, '').trim();

    // Parse the JSON and format the result
    try {
        const jsonResult = JSON.parse(`[${result.replace(/\n/g, ',')}]`);
        const formattedResult = jsonResult.join('').replace(/"/g, '');
        result = formattedResult.replace(/\n/g, '\n• ').replace(/•\s*-\s*/g, '• ');
    } catch (e) {
        // If parsing fails, use the string as is
        result = result.replace(/\n/g, '\n• ').replace(/•\s*-\s*/g, '• ');
    }

    // Return the formatted plain text response
    return new NextResponse(`• ${result}`, {
        headers: { 'Content-Type': 'text/plain' },
    });
}