import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Projects table
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  genreTags: text('genre_tags', { mode: 'json' }).$type<string[]>().default([]),
  bookType: text('book_type').notNull().default('standalone'), // 'standalone' | 'series'
  bookNumber: integer('book_number'),
  totalBooks: integer('total_books'),
  seriesArc: text('series_arc'),
  status: text('status').notNull().default('planning'), // 'planning' | 'first_draft' | 'revising' | 'complete'
  wordCountTarget: integer('word_count_target'),
  lastWorkedOn: integer('last_worked_on', { mode: 'timestamp' }).notNull().default(new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Characters table
export const characters = sqliteTable('characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  age: text('age'),
  appearance: text('appearance'),
  role: text('role'),
  povRole: text('pov_role'), // 'main_pov' | 'major_supporting_pov' | 'supporting_current' | 'supporting_future_major' | 'minor_one_off'
  povPurposes: text('pov_purposes', { mode: 'json' }).$type<string[]>().default([]), // ['plot_advancement', 'worldbuilding', 'thematic_counterpoint', 'character_development', 'antagonist_perspective']
  seriesArcNotes: text('series_arc_notes'),
  appearanceDetails: text('appearance_details'),
  developmentGoals: text('development_goals'),
  relationships: text('relationships', { mode: 'json' }).$type<Record<string, string>>().default({}),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Magic Systems table
export const magicSystems = sqliteTable('magic_systems', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  rules: text('rules').notNull(),
  costs: text('costs'),
  consequences: text('consequences'),
  examples: text('examples'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// World Building table
export const worldBuilding = sqliteTable('world_building', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(), // 'location' | 'faction' | 'timeline' | 'organization'
  name: text('name').notNull(),
  details: text('details'),
  imagePath: text('image_path'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Outlines table
export const outlines = sqliteTable('outlines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  structure: text('structure', { mode: 'json' }).$type<any>().default({}), // Hierarchical JSON structure
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Scenes table
export const scenes = sqliteTable('scenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  outlineId: integer('outline_id').references(() => outlines.id, { onDelete: 'set null' }),
  povCharacterId: integer('pov_character_id').references(() => characters.id, { onDelete: 'set null' }),
  location: text('location'),
  purposeTags: text('purpose_tags', { mode: 'json' }).$type<string[]>().default([]), // ['plot', 'worldbuilding', 'character_development', etc.]
  tensionLevel: integer('tension_level').default(1), // 1-10 scale
  magicUsed: text('magic_used'),
  status: text('status').default('rough'), // 'rough' | 'needs_revision' | 'polished'
  order: integer('order').notNull(),
  title: text('title'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Manuscripts table
export const manuscripts = sqliteTable('manuscripts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  uploadDate: integer('upload_date', { mode: 'timestamp' }).notNull().default(new Date()),
  wordCount: integer('word_count'),
  uploadType: text('upload_type').notNull(), // 'complete' | 'partial' | 'single_chapter'
  sectionsCovered: text('sections_covered'), // e.g., "chapters 1-5"
  versionNumber: integer('version_number').default(1),
  extractedText: text('extracted_text'), // Store the parsed text content
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Conversations table
export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull().default(new Date()),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Thematic Notes table
export const thematicNotes = sqliteTable('thematic_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  theme: text('theme').notNull(),
  description: text('description'),
  examples: text('examples'),
  manifestations: text('manifestations'), // Where this theme appears in the manuscript
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Inspiration Notes table
export const inspirationNotes = sqliteTable('inspiration_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }), // nullable for general inspiration
  content: text('content').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Comp Titles table
export const compTitles = sqliteTable('comp_titles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Manuscript Analysis table
export const manuscriptAnalysis = sqliteTable('manuscript_analysis', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  manuscriptId: integer('manuscript_id').references(() => manuscripts.id, { onDelete: 'cascade' }).notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  analysisType: text('analysis_type').notNull(), // 'pov_distribution' | 'character_analysis' | 'pacing' | 'consistency'
  results: text('results', { mode: 'json' }).$type<any>().default({}),
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'failed'
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// POV Segments table
export const povSegments = sqliteTable('pov_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  manuscriptId: integer('manuscript_id').references(() => manuscripts.id, { onDelete: 'cascade' }).notNull(),
  characterName: text('character_name').notNull(),
  startPosition: integer('start_position').notNull(),
  endPosition: integer('end_position').notNull(),
  wordCount: integer('word_count').notNull(),
  confidence: real('confidence').notNull(), // 0-1 score from AI analysis
  chapter: text('chapter'),
  section: text('section'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Plot Threads table
export const plotThreads = sqliteTable('plot_threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active'), // 'active' | 'resolved' | 'continues_in_sequel'
  resolutionType: text('resolution_type'), // 'standalone' | 'series_arc'
  introducedInChapter: integer('introduced_in_chapter'),
  resolvedInChapter: integer('resolved_in_chapter'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(new Date()),
})

// Zod schemas for validation
export const insertProjectSchema = createInsertSchema(projects)
export const selectProjectSchema = createSelectSchema(projects)

export const insertCharacterSchema = createInsertSchema(characters)
export const selectCharacterSchema = createSelectSchema(characters)

export const insertMagicSystemSchema = createInsertSchema(magicSystems)
export const selectMagicSystemSchema = createSelectSchema(magicSystems)

export const insertWorldBuildingSchema = createInsertSchema(worldBuilding)
export const selectWorldBuildingSchema = createSelectSchema(worldBuilding)

export const insertOutlineSchema = createInsertSchema(outlines)
export const selectOutlineSchema = createSelectSchema(outlines)

export const insertSceneSchema = createInsertSchema(scenes)
export const selectSceneSchema = createSelectSchema(scenes)

export const insertManuscriptSchema = createInsertSchema(manuscripts)
export const selectManuscriptSchema = createSelectSchema(manuscripts)

export const insertConversationSchema = createInsertSchema(conversations)
export const selectConversationSchema = createSelectSchema(conversations)

export const insertThematicNoteSchema = createInsertSchema(thematicNotes)
export const selectThematicNoteSchema = createSelectSchema(thematicNotes)

export const insertInspirationNoteSchema = createInsertSchema(inspirationNotes)
export const selectInspirationNoteSchema = createSelectSchema(inspirationNotes)

export const insertCompTitleSchema = createInsertSchema(compTitles)
export const selectCompTitleSchema = createSelectSchema(compTitles)

export const insertPlotThreadSchema = createInsertSchema(plotThreads)
export const selectPlotThreadSchema = createSelectSchema(plotThreads)

export const insertManuscriptAnalysisSchema = createInsertSchema(manuscriptAnalysis)
export const selectManuscriptAnalysisSchema = createSelectSchema(manuscriptAnalysis)

export const insertPovSegmentSchema = createInsertSchema(povSegments)
export const selectPovSegmentSchema = createSelectSchema(povSegments)

// Types
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Character = typeof characters.$inferSelect
export type NewCharacter = typeof characters.$inferInsert

export type MagicSystem = typeof magicSystems.$inferSelect
export type NewMagicSystem = typeof magicSystems.$inferInsert

export type WorldBuilding = typeof worldBuilding.$inferSelect
export type NewWorldBuilding = typeof worldBuilding.$inferInsert

export type Outline = typeof outlines.$inferSelect
export type NewOutline = typeof outlines.$inferInsert

export type Scene = typeof scenes.$inferSelect
export type NewScene = typeof scenes.$inferInsert

export type Manuscript = typeof manuscripts.$inferSelect
export type NewManuscript = typeof manuscripts.$inferInsert

export type Conversation = typeof conversations.$inferSelect
export type NewConversation = typeof conversations.$inferInsert

export type ThematicNote = typeof thematicNotes.$inferSelect
export type NewThematicNote = typeof thematicNotes.$inferInsert

export type InspirationNote = typeof inspirationNotes.$inferSelect
export type NewInspirationNote = typeof inspirationNotes.$inferInsert

export type CompTitle = typeof compTitles.$inferSelect
export type NewCompTitle = typeof compTitles.$inferInsert

export type PlotThread = typeof plotThreads.$inferSelect
export type NewPlotThread = typeof plotThreads.$inferInsert

export type ManuscriptAnalysis = typeof manuscriptAnalysis.$inferSelect
export type NewManuscriptAnalysis = typeof manuscriptAnalysis.$inferInsert

export type PovSegment = typeof povSegments.$inferSelect
export type NewPovSegment = typeof povSegments.$inferInsert