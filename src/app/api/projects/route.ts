import { NextRequest, NextResponse } from 'next/server'
import { db, projects, insertProjectSchema } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.lastWorkedOn))

    return NextResponse.json(allProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the input
    const validatedData = insertProjectSchema.parse({
      ...body,
      lastWorkedOn: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const [newProject] = await db
      .insert(projects)
      .values(validatedData)
      .returning()

    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}