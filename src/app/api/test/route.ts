import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const { supabase } = await import("@/lib/supabase");

    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .limit(10);

    if (error) {

      return NextResponse.json({
        success: false,
        error: error.message,
      });

    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch {

    return NextResponse.json({
      success: false,
      error: "Supabase connection failed.",
    });

  }

}
