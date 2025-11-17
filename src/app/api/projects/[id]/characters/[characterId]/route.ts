import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { characters, insertCharacterSchema } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const updateCharacterSchema = insertCharacterSchema.partial().omit({
  projectId: true,
  createdAt: true
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: projectId, characterId } = await params

    if (isNaN(parseInt(projectId)) || isNaN(parseInt(characterId))) {
      return NextResponse.json(
        { error: 'Invalid project ID or character ID' },
        { status: 400 }
      )
    }

    const [character] = await db
      .select()
      .from(characters)
      .where(and(
        eq(characters.id, parseInt(characterId)),
        eq(characters.projectId, parseInt(projectId))
      ))

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(character)

  } catch (error) {
    console.error('Get character error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: projectId, characterId } = await params

    if (isNaN(parseInt(projectId)) || isNaN(parseInt(characterId))) {
      return NextResponse.json(
        { error: 'Invalid project ID or character ID' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate the character data
    const characterData = updateCharacterSchema.parse({
      ...body,
      updatedAt: new Date()
    })

    const [updatedCharacter] = await db
      .update(characters)
      .set(characterData)
      .where(and(
        eq(characters.id, parseInt(characterId)),
        eq(characters.projectId, parseInt(projectId))
      ))
      .returning()

    if (!updatedCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedCharacter)

  } catch (error) {
    console.error('Update character error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid character data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; characterId: string }> }
) {
  try {
    const { id: projectId, characterId } = await params

    if (isNaN(parseInt(projectId)) || isNaN(parseInt(characterId))) {
      return NextResponse.json(
        { error: 'Invalid project ID or character ID' },
        { status: 400 }
      )
    }

    const [deletedCharacter] = await db
      .delete(characters)
      .where(and(
        eq(characters.id, parseInt(characterId)),
        eq(characters.projectId, parseInt(projectId))
      ))
      .returning()

    if (!deletedCharacter) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, deletedCharacter })

  } catch (error) {
    console.error('Delete character error:', error)
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    )
  }
}