import { NextRequest, NextResponse } from 'next/server'
import { db, manuscripts } from '@/lib/db'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const projectId = parseInt(id)

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      )
    }

    const projectManuscripts = await db
      .select()
      .from(manuscripts)
      .where(eq(manuscripts.projectId, projectId))
      .orderBy(manuscripts.uploadDate)

    return NextResponse.json(projectManuscripts)
  } catch (error) {
    console.error('Error fetching manuscripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manuscripts' },
      { status: 500 }
    )
  }
}