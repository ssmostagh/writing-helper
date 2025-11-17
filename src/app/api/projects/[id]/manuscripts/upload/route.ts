import { NextRequest, NextResponse } from 'next/server'
import { db, manuscripts } from '@/lib/db'
import path from 'path'
import fs from 'fs/promises'
import { PdfReader } from 'pdfreader'
import mammoth from 'mammoth'
import JSZip from 'jszip'

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

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/epub+zip'
    ]
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.epub')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, TXT, or EPUB files.' },
        { status: 400 }
      )
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads', projectId.toString())
    await fs.mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `${timestamp}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filePath, buffer)

    // Extract text content based on file type
    let extractedText = ''
    let wordCount = 0

    try {
      if (file.type === 'application/pdf') {
        // PDF extraction using pdfreader
        extractedText = await new Promise((resolve, reject) => {
          let text = ''
          new PdfReader().parseBuffer(buffer, (err: any, item: any) => {
            if (err) {
              reject(err)
            } else if (!item) {
              resolve(text)
            } else if (item.text) {
              text += item.text + ' '
            }
          })
        })
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOCX extraction
        const result = await mammoth.extractRawText({ path: filePath })
        extractedText = result.value
      } else if (file.type === 'text/plain') {
        // TXT extraction
        extractedText = await fs.readFile(filePath, 'utf-8')
      } else if (file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub')) {
        // EPUB extraction using JSZip
        try {
          const zip = new JSZip()
          const epub = await zip.loadAsync(buffer)
          const files = Object.keys(epub.files)

          // Find HTML/XHTML files that contain the book content
          const contentFiles = files.filter(file =>
            (file.endsWith('.html') || file.endsWith('.xhtml')) &&
            !file.includes('nav') && !file.includes('toc')
          )

          let allText = ''
          for (const filename of contentFiles) {
            try {
              const content = await epub.files[filename].async('text')
              // Remove HTML tags and extract text
              const textContent = content
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]*>/g, ' ')
                .replace(/&\w+;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
              allText += textContent + ' '
            } catch (fileError) {
              console.warn(`Could not read EPUB file ${filename}:`, fileError)
            }
          }

          extractedText = allText.trim()
        } catch (epubError) {
          console.warn('EPUB parsing with JSZip failed, trying alternative method:', epubError)

          // Fallback: try to read as a simpler EPUB structure
          try {
            const zip = new JSZip()
            const epub = await zip.loadAsync(buffer)
            const files = Object.keys(epub.files)

            let allText = ''
            for (const filename of files) {
              if (filename.includes('.htm') || filename.includes('.txt')) {
                try {
                  const content = await epub.files[filename].async('text')
                  const textContent = content
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                  allText += textContent + ' '
                } catch (fileError) {
                  // Continue with other files
                }
              }
            }

            extractedText = allText.trim()
          } catch (fallbackError) {
            console.warn('EPUB fallback parsing failed:', fallbackError)
            extractedText = ''
          }
        }
      }

      // Count words
      wordCount = extractedText.trim().split(/\s+/).filter(word => word.length > 0).length

      // Debug logging
      console.log(`File: ${file.name}, Type: ${file.type}, Extracted text length: ${extractedText.length}, Word count: ${wordCount}`)
      if (extractedText.length < 500) {
        console.log('Extracted text preview:', extractedText.substring(0, 300))
      }
    } catch (extractError) {
      console.warn('Text extraction failed:', extractError)
      // Continue without extracted text
    }

    // Determine upload type based on word count and filename
    let uploadType = 'partial'
    if (wordCount > 50000) {  // Lowered threshold for complete manuscripts (novels are typically 50k+ words)
      uploadType = 'complete'
    } else if (wordCount < 3000) {  // Lowered threshold for single chapters
      uploadType = 'single_chapter'
    }

    // For EPUB files, be more generous since they're usually complete books
    if ((file.type === 'application/epub+zip' || file.name.toLowerCase().endsWith('.epub')) && wordCount > 20000) {
      uploadType = 'complete'
    }

    // Save manuscript record to database
    const [newManuscript] = await db
      .insert(manuscripts)
      .values({
        projectId,
        fileName: file.name,
        filePath,
        wordCount: wordCount > 0 ? wordCount : null,
        uploadType,
        versionNumber: 1,
        extractedText: extractedText || null,
        uploadDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return NextResponse.json(newManuscript, { status: 201 })
  } catch (error) {
    console.error('Error uploading manuscript:', error)
    return NextResponse.json(
      { error: 'Failed to upload manuscript' },
      { status: 500 }
    )
  }
}