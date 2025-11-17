import { NextRequest, NextResponse } from 'next/server'
import { db, manuscripts } from '@/lib/db'
import { eq, and } from 'drizzle-orm'
import fs from 'fs/promises'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; manuscriptId: string }> }
) {
  try {
    const { id, manuscriptId: manuscriptIdStr } = await params
    const projectId = parseInt(id)
    const manuscriptId = parseInt(manuscriptIdStr)

    if (isNaN(projectId) || isNaN(manuscriptId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      )
    }

    // Get manuscript info before deleting
    const [manuscript] = await db
      .select()
      .from(manuscripts)
      .where(and(
        eq(manuscripts.id, manuscriptId),
        eq(manuscripts.projectId, projectId)
      ))
      .limit(1)

    if (!manuscript) {
      return NextResponse.json(
        { error: 'Manuscript not found' },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    try {
      await fs.unlink(manuscript.filePath)
    } catch (fileError) {
      console.warn('Failed to delete file:', fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await db
      .delete(manuscripts)
      .where(and(
        eq(manuscripts.id, manuscriptId),
        eq(manuscripts.projectId, projectId)
      ))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting manuscript:', error)
    return NextResponse.json(
      { error: 'Failed to delete manuscript' },
      { status: 500 }
    )
  }
}