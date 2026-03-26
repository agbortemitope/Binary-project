import { NextRequest, NextResponse } from "next/server";

function resolveCollectionId(request: NextRequest, formData?: FormData) {
  const formVerification = formData?.get("verification");

  return (
    request.nextUrl.searchParams.get("verification") ??
    request.nextUrl.searchParams.get("collectionId") ??
    (typeof formVerification === "string" && formVerification.trim() ? formVerification : null) ??
    null
  );
}

function makeRedirectUrl(request: NextRequest, collectionId: string | null) {
  const url = new URL("/lead/wallet", request.nextUrl.origin);
  if (collectionId) {
    url.searchParams.set("verification", collectionId);
  }
  return url;
}

export async function GET(request: NextRequest) {
  const collectionId = resolveCollectionId(request);
  return NextResponse.redirect(makeRedirectUrl(request, collectionId), { status: 303 });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")
    ? await request.formData()
    : undefined;

  const collectionId = resolveCollectionId(request, formData);
  return NextResponse.redirect(makeRedirectUrl(request, collectionId), { status: 303 });
}
