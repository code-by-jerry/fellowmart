import { NextResponse } from "next/server";

export function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}
