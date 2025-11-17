import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { characters, insertCharacterSchema } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

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

    const projectCharacters = await db
      .select()
      .from(characters)
      .where(eq(characters.projectId, projectId))
      .orderBy(characters.name)

    return NextResponse.json({ characters: projectCharacters })

  } catch (error) {
    console.error('Get characters error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const body = await request.json()

    // Validate the character data
    const characterData = insertCharacterSchema.parse({
      ...body,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const [newCharacter] = await db
      .insert(characters)
      .values(characterData)
      .returning()

    return NextResponse.json(newCharacter, { status: 201 })

  } catch (error) {
    console.error('Create character error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid character data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    )
  }
}