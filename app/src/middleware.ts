import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/ingest")) {
    return NextResponse.next({
      request: { headers: stripCookies(request.headers) },
    });
  }

  return await updateSession(request);
}

function stripCookies(headers: Headers): Headers {
  const cleaned = new Headers(headers);
  cleaned.delete("cookie");
  return cleaned;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
