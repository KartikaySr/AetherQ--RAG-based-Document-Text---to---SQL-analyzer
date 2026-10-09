export async function POST() {
  return Response.json({ error: "Use anonymous sign-in through Supabase Auth." }, { status: 410 });
}
