import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Enable mock mode when no valid API key is provided
const MOCK_MODE = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here'

export interface POVAnalysisResult {
  segments: Array<{
    character: string
    startPosition: number
    endPosition: number
    wordCount: number
    confidence: number
    chapter?: string
    section?: string
    text_snippet: string
  }>
  summary: {
    total_words: number
    characters_detected: Array<{
      name: string
      word_count: number
      percentage: number
      segments: number
    }>
    pov_switches: number
    average_segment_length: number
  }
}

export interface CharacterAnalysisResult {
  characters: Array<{
    name: string
    role: string
    traits: string[]
    relationships: string[]
    development_arc: string
    scenes_appeared: number
  }>
  main_characters: string[]
  supporting_characters: string[]
}

// Helper function to chunk text intelligently
function chunkText(text: string, maxChunkSize: number = 100000): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentLength = 0

  for (const word of words) {
    if (currentLength + word.length + 1 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '))
      currentChunk = [word]
      currentLength = word.length
    } else {
      currentChunk.push(word)
      currentLength += word.length + 1
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '))
  }

  return chunks
}

export async function analyzePOVDistribution(text: string): Promise<POVAnalysisResult> {
  const chunks = chunkText(text, 80000) // Smaller chunks to fit within token limits
  const allSegments: any[] = []
  const characterCounts: Map<string, { word_count: number, segments: number }> = new Map()
  let totalWords = text.split(' ').filter(word => word.length > 0).length

  console.log(`Analyzing POV distribution in ${chunks.length} chunks, total words: ${totalWords}`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkOffset = chunks.slice(0, i).join(' ').length + (i > 0 ? i : 0) // Calculate character offset

    const prompt = `Analyze this manuscript text chunk (${i + 1}/${chunks.length}) for Point of View (POV) distribution.

IMPORTANT: This is chunk ${i + 1} of ${chunks.length}. Character positions should be relative to this chunk, starting at position 0.

Identify:
1. POV character segments in this chunk
2. Character names and POV switches
3. Word count and position for each segment within this chunk
4. Confidence level (0-1)
5. Chapter/section markers if present

Text to analyze (chunk ${i + 1}/${chunks.length}):
${chunk}

Return a JSON object with this structure:
{
  "segments": [
    {
      "character": "Character Name",
      "startPosition": 0,
      "endPosition": 1500,
      "wordCount": 750,
      "confidence": 0.95,
      "chapter": "Chapter X",
      "section": "Section name",
      "text_snippet": "First 100 characters of the segment..."
    }
  ],
  "chunk_info": {
    "chunk_number": ${i + 1},
    "total_chunks": ${chunks.length},
    "chunk_words": ${chunk.split(' ').filter(w => w.length > 0).length}
  }
}

Focus on POV shifts, character thoughts/internal dialogue, and narrative perspective changes in this chunk.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const chunkResult = JSON.parse(jsonMatch[0])

          // Adjust segment positions to be relative to the full text
          if (chunkResult.segments) {
            chunkResult.segments.forEach((segment: any) => {
              segment.startPosition += chunkOffset
              segment.endPosition += chunkOffset
              allSegments.push(segment)

              // Track character counts
              const charName = segment.character
              if (characterCounts.has(charName)) {
                const existing = characterCounts.get(charName)!
                existing.word_count += segment.wordCount || 0
                existing.segments += 1
              } else {
                characterCounts.set(charName, {
                  word_count: segment.wordCount || 0,
                  segments: 1
                })
              }
            })
          }
        }
      }
    } catch (error) {
      console.error(`POV analysis error for chunk ${i + 1}:`, error)
      // Continue with other chunks even if one fails
    }
  }

  // Compile final results
  const charactersDetected = Array.from(characterCounts.entries()).map(([name, counts]) => ({
    name,
    word_count: counts.word_count,
    percentage: totalWords > 0 ? (counts.word_count / totalWords) * 100 : 0,
    segments: counts.segments
  }))

  const povSwitches = Math.max(0, allSegments.length - 1)
  const avgSegmentLength = allSegments.length > 0 ?
    allSegments.reduce((sum, seg) => sum + (seg.wordCount || 0), 0) / allSegments.length : 0

  return {
    segments: allSegments,
    summary: {
      total_words: totalWords,
      characters_detected: charactersDetected,
      pov_switches: povSwitches,
      average_segment_length: Math.round(avgSegmentLength)
    }
  }
}

export async function analyzeCharacters(text: string): Promise<CharacterAnalysisResult> {
  const chunks = chunkText(text, 80000)
  const allCharacters: Map<string, any> = new Map()
  let mainCharacters: Set<string> = new Set()
  let supportingCharacters: Set<string> = new Set()

  console.log(`Analyzing characters in ${chunks.length} chunks`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    const prompt = `Analyze this manuscript text chunk (${i + 1}/${chunks.length}) to identify and categorize characters.

IMPORTANT: This is chunk ${i + 1} of ${chunks.length}. Focus on characters that appear in this specific chunk.

Identify:
1. All named characters in this chunk
2. Their apparent roles
3. Key traits and personality
4. Relationships with other characters
5. Development/growth shown in this chunk
6. Significance level in this chunk

Text to analyze (chunk ${i + 1}/${chunks.length}):
${chunk}

Return a JSON object with this structure:
{
  "characters": [
    {
      "name": "Character Name",
      "role": "protagonist|antagonist|supporting|minor",
      "traits": ["brave", "determined"],
      "relationships": ["friend of X", "rival of Y"],
      "development_arc": "Growth shown in this chunk",
      "scenes_appeared_in_chunk": 3,
      "significance": "major|moderate|minor"
    }
  ],
  "main_characters": ["Characters with major presence in this chunk"],
  "supporting_characters": ["Characters with moderate presence"]
}

Focus on characters with dialogue, actions, or significant mentions.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const chunkResult = JSON.parse(jsonMatch[0])

          // Merge character data
          if (chunkResult.characters) {
            chunkResult.characters.forEach((char: any) => {
              if (allCharacters.has(char.name)) {
                const existing = allCharacters.get(char.name)!
                // Merge traits
                const newTraits = char.traits || []
                existing.traits = [...new Set([...existing.traits, ...newTraits])]

                // Merge relationships
                const newRels = char.relationships || []
                existing.relationships = [...new Set([...existing.relationships, ...newRels])]

                // Combine development arcs
                if (char.development_arc && !existing.development_arc.includes(char.development_arc)) {
                  existing.development_arc += '; ' + char.development_arc
                }

                // Update scenes count
                existing.scenes_appeared += char.scenes_appeared_in_chunk || 0

                // Update role if more significant
                if (char.role === 'protagonist' || (char.role === 'antagonist' && existing.role !== 'protagonist')) {
                  existing.role = char.role
                }
              } else {
                allCharacters.set(char.name, {
                  name: char.name,
                  role: char.role || 'minor',
                  traits: char.traits || [],
                  relationships: char.relationships || [],
                  development_arc: char.development_arc || '',
                  scenes_appeared: char.scenes_appeared_in_chunk || 0
                })
              }
            })
          }

          // Track main and supporting characters
          if (chunkResult.main_characters) {
            chunkResult.main_characters.forEach((name: string) => mainCharacters.add(name))
          }
          if (chunkResult.supporting_characters) {
            chunkResult.supporting_characters.forEach((name: string) => supportingCharacters.add(name))
          }
        }
      }
    } catch (error) {
      console.error(`Character analysis error for chunk ${i + 1}:`, error)
      // Continue with other chunks
    }
  }

  // Compile final results
  const characters = Array.from(allCharacters.values())

  return {
    characters,
    main_characters: Array.from(mainCharacters),
    supporting_characters: Array.from(supportingCharacters)
  }
}

export async function analyzePacing(text: string): Promise<any> {
  const chunks = chunkText(text, 80000)
  const pacingData: any[] = []
  let overallMetrics = {
    total_words: text.split(' ').filter(w => w.length > 0).length,
    action_percentage: 0,
    dialogue_percentage: 0,
    description_percentage: 0,
    tension_points: [],
    pacing_issues: []
  }

  console.log(`Analyzing pacing in ${chunks.length} chunks`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    const prompt = `Analyze the pacing and narrative flow of this manuscript chunk (${i + 1}/${chunks.length}).

IMPORTANT: This is chunk ${i + 1} of ${chunks.length}. Analyze pacing within this specific section.

Identify:
1. Action vs. dialogue vs. description ratios in this chunk
2. Scene transitions and chapter breaks
3. Tension levels and changes
4. Pacing issues (too fast/slow sections)
5. Key momentum points

Text to analyze (chunk ${i + 1}/${chunks.length}):
${chunk}

Return a JSON object with this structure:
{
  "chunk_metrics": {
    "chunk_number": ${i + 1},
    "word_count": ${chunk.split(' ').filter(w => w.length > 0).length},
    "action_percentage": 30,
    "dialogue_percentage": 40,
    "description_percentage": 30,
    "average_tension": 6,
    "tension_changes": ["low to high at scene break", "sustained high tension"]
  },
  "pacing_notes": ["Fast-paced action sequence", "Slow exposition section"],
  "momentum_points": ["Chapter climax", "Plot revelation"],
  "issues": ["Too much exposition in middle", "Abrupt scene transition"]
}

Focus on narrative flow, tension patterns, and pacing effectiveness.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const chunkResult = JSON.parse(jsonMatch[0])
          pacingData.push(chunkResult)

          // Accumulate metrics
          if (chunkResult.chunk_metrics) {
            overallMetrics.pacing_issues.push(...(chunkResult.issues || []))
          }
        } else {
          // Fallback to text analysis
          pacingData.push({ analysis: content.text, chunk: i + 1 })
        }
      }
    } catch (error) {
      console.error(`Pacing analysis error for chunk ${i + 1}:`, error)
      pacingData.push({ error: `Failed to analyze chunk ${i + 1}`, chunk: i + 1 })
    }
  }

  // Calculate overall metrics
  const validChunks = pacingData.filter(d => d.chunk_metrics)
  if (validChunks.length > 0) {
    overallMetrics.action_percentage = Math.round(
      validChunks.reduce((sum, d) => sum + (d.chunk_metrics.action_percentage || 0), 0) / validChunks.length
    )
    overallMetrics.dialogue_percentage = Math.round(
      validChunks.reduce((sum, d) => sum + (d.chunk_metrics.dialogue_percentage || 0), 0) / validChunks.length
    )
    overallMetrics.description_percentage = Math.round(
      validChunks.reduce((sum, d) => sum + (d.chunk_metrics.description_percentage || 0), 0) / validChunks.length
    )
  }

  return {
    overall_metrics: overallMetrics,
    chunk_analyses: pacingData,
    summary: `Analyzed ${chunks.length} chunks totaling ${overallMetrics.total_words} words. Average composition: ${overallMetrics.action_percentage}% action, ${overallMetrics.dialogue_percentage}% dialogue, ${overallMetrics.description_percentage}% description.`
  }
}

export async function checkConsistency(text: string): Promise<any> {
  const chunks = chunkText(text, 80000)
  const consistencyIssues: any[] = []
  const characterNames: Set<string> = new Set()
  const timelineEvents: any[] = []

  console.log(`Checking consistency across ${chunks.length} chunks`)

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]

    const prompt = `Analyze this manuscript chunk (${i + 1}/${chunks.length}) for consistency issues.

IMPORTANT: This is chunk ${i + 1} of ${chunks.length}. Look for issues within this chunk and note patterns.

Look for:
1. Character name variations or inconsistencies
2. Timeline or chronological issues
3. Description contradictions
4. Plot holes or logical inconsistencies
5. Continuity errors within this chunk

Text to analyze (chunk ${i + 1}/${chunks.length}):
${chunk}

Return a JSON object with this structure:
{
  "character_names": ["List all character names mentioned"],
  "issues": [
    {
      "type": "character|timeline|description|plot|continuity",
      "severity": "minor|moderate|major",
      "description": "Brief description of the issue",
      "location": "Approximate location in chunk",
      "suggestion": "How to fix it"
    }
  ],
  "timeline_events": [
    {
      "event": "What happened",
      "when": "Time reference",
      "location": "Where in chunk"
    }
  ],
  "chunk_summary": "Brief summary of this chunk's content"
}

Focus on identifying actual inconsistencies, not stylistic preferences.`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const chunkResult = JSON.parse(jsonMatch[0])

          // Collect character names
          if (chunkResult.character_names) {
            chunkResult.character_names.forEach((name: string) => characterNames.add(name))
          }

          // Collect issues
          if (chunkResult.issues) {
            chunkResult.issues.forEach((issue: any) => {
              consistencyIssues.push({
                ...issue,
                chunk: i + 1,
                total_chunks: chunks.length
              })
            })
          }

          // Collect timeline events
          if (chunkResult.timeline_events) {
            timelineEvents.push(...chunkResult.timeline_events.map((event: any) => ({
              ...event,
              chunk: i + 1
            })))
          }
        } else {
          // Fallback
          consistencyIssues.push({
            type: 'analysis',
            severity: 'minor',
            description: `Raw analysis for chunk ${i + 1}`,
            location: `Chunk ${i + 1}`,
            suggestion: content.text,
            chunk: i + 1
          })
        }
      }
    } catch (error) {
      console.error(`Consistency analysis error for chunk ${i + 1}:`, error)
      consistencyIssues.push({
        type: 'error',
        severity: 'minor',
        description: `Failed to analyze chunk ${i + 1}`,
        location: `Chunk ${i + 1}`,
        suggestion: 'Retry analysis',
        chunk: i + 1
      })
    }
  }

  // Analyze cross-chunk consistency
  const majorIssues = consistencyIssues.filter(issue => issue.severity === 'major')
  const moderateIssues = consistencyIssues.filter(issue => issue.severity === 'moderate')
  const minorIssues = consistencyIssues.filter(issue => issue.severity === 'minor')

  return {
    summary: {
      total_chunks_analyzed: chunks.length,
      total_issues: consistencyIssues.length,
      major_issues: majorIssues.length,
      moderate_issues: moderateIssues.length,
      minor_issues: minorIssues.length,
      unique_characters: Array.from(characterNames),
      timeline_events: timelineEvents.length
    },
    issues_by_severity: {
      major: majorIssues,
      moderate: moderateIssues,
      minor: minorIssues
    },
    all_issues: consistencyIssues,
    character_names: Array.from(characterNames),
    timeline_events: timelineEvents
  }
}