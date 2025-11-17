import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { manuscripts, manuscriptAnalysis, povSegments } from '@/lib/db/schema'
import { analyzePOVDistribution, analyzeCharacters, analyzePacing, checkConsistency } from '@/lib/claude'
import { eq, and, desc } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; manuscriptId: string }> }
) {
  try {
    const { id: projectId, manuscriptId } = await params
    const { analysisType } = await request.json()

    if (!analysisType) {
      return NextResponse.json({ error: 'Analysis type is required' }, { status: 400 })
    }

    // Get the manuscript
    const [manuscript] = await db
      .select()
      .from(manuscripts)
      .where(and(
        eq(manuscripts.id, parseInt(manuscriptId)),
        eq(manuscripts.projectId, parseInt(projectId))
      ))

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 })
    }

    if (!manuscript.extractedText) {
      return NextResponse.json({ error: 'No text content available for analysis' }, { status: 400 })
    }

    // Create analysis record
    const [analysis] = await db
      .insert(manuscriptAnalysis)
      .values({
        manuscriptId: manuscript.id,
        projectId: parseInt(projectId),
        analysisType,
        status: 'in_progress',
        results: {},
      })
      .returning()

    // Perform analysis based on type
    try {
      let results

      switch (analysisType) {
        case 'pov_distribution':
          results = await analyzePOVDistribution(manuscript.extractedText)

          // Store POV segments in the database
          if (results.segments && results.segments.length > 0) {
            await db.insert(povSegments).values(
              results.segments.map(segment => ({
                manuscriptId: manuscript.id,
                characterName: segment.character,
                startPosition: segment.startPosition,
                endPosition: segment.endPosition,
                wordCount: segment.wordCount,
                confidence: segment.confidence,
                chapter: segment.chapter || null,
                section: segment.section || null,
              }))
            )
          }
          break

        case 'character_analysis':
          results = await analyzeCharacters(manuscript.extractedText)
          break

        case 'pacing':
          results = await analyzePacing(manuscript.extractedText)
          break

        case 'consistency':
          results = await checkConsistency(manuscript.extractedText)
          break

        default:
          throw new Error(`Unknown analysis type: ${analysisType}`)
      }

      // Update analysis with results
      await db
        .update(manuscriptAnalysis)
        .set({
          results,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(manuscriptAnalysis.id, analysis.id))

      return NextResponse.json({
        success: true,
        analysisId: analysis.id,
        results,
      })

    } catch (analysisError) {
      console.error('Analysis error:', analysisError)

      // Update analysis with error
      await db
        .update(manuscriptAnalysis)
        .set({
          status: 'failed',
          error: analysisError instanceof Error ? analysisError.message : 'Unknown error',
          updatedAt: new Date(),
        })
        .where(eq(manuscriptAnalysis.id, analysis.id))

      return NextResponse.json({
        error: 'Analysis failed',
        message: analysisError instanceof Error ? analysisError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json({ error: 'Failed to process analysis request' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; manuscriptId: string }> }
) {
  try {
    const { id: projectId, manuscriptId } = await params

    // Get all analyses for this manuscript
    const analyses = await db
      .select()
      .from(manuscriptAnalysis)
      .where(and(
        eq(manuscriptAnalysis.manuscriptId, parseInt(manuscriptId)),
        eq(manuscriptAnalysis.projectId, parseInt(projectId))
      ))
      .orderBy(desc(manuscriptAnalysis.createdAt))

    return NextResponse.json({ analyses })

  } catch (error) {
    console.error('Get analyses error:', error)
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; manuscriptId: string }> }
) {
  try {
    const { id: projectId, manuscriptId } = await params
    const url = new URL(request.url)
    const analysisId = url.searchParams.get('analysisId')

    if (!analysisId) {
      return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
    }

    // Delete the specific analysis
    await db
      .delete(manuscriptAnalysis)
      .where(and(
        eq(manuscriptAnalysis.id, parseInt(analysisId)),
        eq(manuscriptAnalysis.manuscriptId, parseInt(manuscriptId)),
        eq(manuscriptAnalysis.projectId, parseInt(projectId))
      ))

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete analysis error:', error)
    return NextResponse.json({ error: 'Failed to delete analysis' }, { status: 500 })
  }
}