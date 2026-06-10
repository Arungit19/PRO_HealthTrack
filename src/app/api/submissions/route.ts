import { createSubmission, listSubmissions } from '@/lib/submissions';
import { getAuthenticatedUser, requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Admin access is required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const submissions = await listSubmissions({
      search: searchParams.get('search') ?? undefined,
      date: searchParams.get('date') ?? undefined,
      status: searchParams.get('status') ?? undefined,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to load submissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser();
    if (!authenticatedUser || authenticatedUser.role !== 'user') {
      return NextResponse.json({ error: 'A user login is required.' }, { status: 401 });
    }

    const body = await request.json();
    const age = Number(body.age);

    if (
      !body.fullName?.trim() ||
      !body.gender ||
      !Number.isInteger(age) ||
      age < 1 ||
      (
        body.contactNumber?.trim() &&
        !/^\d{10}$/.test(body.contactNumber.trim())
      ) ||
      !body.reference?.trim()
    ) {
      return NextResponse.json({ error: 'Missing or invalid form fields' }, { status: 400 });
    }

    const submission = await createSubmission({
      userId: authenticatedUser.id,
      fullName: body.fullName.trim(),
      gender: body.gender,
      age,
      contactNumber: body.contactNumber?.trim() || null,
      reference: body.reference.trim(),
      documents: Array.isArray(body.documents) ? body.documents : [],
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to save submission' }, { status: 500 });
  }
}
