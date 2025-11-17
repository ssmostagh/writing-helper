'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/db/schema'

interface Character {
  id: number
  name: string
  age?: string
  appearance?: string
  role?: string
  povRole?: string
  povPurposes: string[]
  seriesArcNotes?: string
  appearanceDetails?: string
  developmentGoals?: string
  relationships: Record<string, string>
  createdAt: Date
  updatedAt: Date
}

interface CharactersTabProps {
  project: Project
}

const POV_ROLES = [
  { value: 'main_pov', label: 'Main POV' },
  { value: 'major_supporting_pov', label: 'Major Supporting POV' },
  { value: 'supporting_current', label: 'Supporting (Current)' },
  { value: 'supporting_future_major', label: 'Supporting (Future Major)' },
  { value: 'minor_one_off', label: 'Minor One-off' },
]

const POV_PURPOSES = [
  { value: 'plot_advancement', label: 'Plot Advancement' },
  { value: 'worldbuilding', label: 'Worldbuilding' },
  { value: 'thematic_counterpoint', label: 'Thematic Counterpoint' },
  { value: 'character_development', label: 'Character Development' },
  { value: 'antagonist_perspective', label: 'Antagonist Perspective' },
]

export function CharactersTab({ project }: CharactersTabProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    appearance: '',
    role: '',
    povRole: '',
    povPurposes: [] as string[],
    seriesArcNotes: '',
    appearanceDetails: '',
    developmentGoals: '',
    relationships: {} as Record<string, string>
  })

  const fetchCharacters = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/characters`)
      if (response.ok) {
        const data = await response.json()
        setCharacters(data.characters)
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacters()
  }, [project.id])

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      appearance: '',
      role: '',
      povRole: '',
      povPurposes: [],
      seriesArcNotes: '',
      appearanceDetails: '',
      developmentGoals: '',
      relationships: {}
    })
  }

  const handleCreate = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCharacters()
        setIsCreating(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create character:', error)
    }
  }

  const handleUpdate = async (characterId: number) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCharacters()
        setEditingId(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update character:', error)
    }
  }

  const handleDelete = async (characterId: number) => {
    if (!confirm('Are you sure you want to delete this character?')) return

    try {
      const response = await fetch(`/api/projects/${project.id}/characters/${characterId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCharacters()
      }
    } catch (error) {
      console.error('Failed to delete character:', error)
    }
  }

  const startEdit = (character: Character) => {
    setFormData({
      name: character.name,
      age: character.age || '',
      appearance: character.appearance || '',
      role: character.role || '',
      povRole: character.povRole || '',
      povPurposes: character.povPurposes || [],
      seriesArcNotes: character.seriesArcNotes || '',
      appearanceDetails: character.appearanceDetails || '',
      developmentGoals: character.developmentGoals || '',
      relationships: character.relationships || {}
    })
    setEditingId(character.id)
  }

  const togglePovPurpose = (purpose: string) => {
    setFormData(prev => ({
      ...prev,
      povPurposes: prev.povPurposes.includes(purpose)
        ? prev.povPurposes.filter(p => p !== purpose)
        : [...prev.povPurposes, purpose]
    }))
  }

  if (loading) {
    return <div className="p-6">Loading characters...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl">👥</div>
          <h2 className="text-xl font-semibold">Character Database</h2>
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">{characters.length}</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>+</span>
          Add Character
        </button>
      </div>

      {/* Create Character Form */}
      {isCreating && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Character</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Character name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Age or age range"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g., Protagonist, Antagonist, Mentor"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">POV Role</label>
                <select
                  value={formData.povRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, povRole: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">Select POV role</option>
                  {POV_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">POV Purposes</label>
              <div className="flex flex-wrap gap-2">
                {POV_PURPOSES.map(purpose => (
                  <button
                    key={purpose.value}
                    type="button"
                    onClick={() => togglePovPurpose(purpose.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.povPurposes.includes(purpose.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                    }`}
                  >
                    {purpose.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Appearance</label>
              <textarea
                value={formData.appearance}
                onChange={(e) => setFormData(prev => ({ ...prev, appearance: e.target.value }))}
                placeholder="Brief appearance description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Development Goals</label>
              <textarea
                value={formData.developmentGoals}
                onChange={(e) => setFormData(prev => ({ ...prev, developmentGoals: e.target.value }))}
                placeholder="Character development arc and goals"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Series Arc Notes</label>
              <textarea
                value={formData.seriesArcNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, seriesArcNotes: e.target.value }))}
                placeholder="Long-term character development across series"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!formData.name}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                💾 Create Character
              </button>
              <button
                onClick={() => { setIsCreating(false); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Characters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <div key={character.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {editingId === character.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Character name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Age"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Role"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
                <select
                  value={formData.povRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, povRole: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value="">POV Role</option>
                  {POV_ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(character.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    💾
                  </button>
                  <button
                    onClick={() => { setEditingId(null); resetForm(); }}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{character.name}</h3>
                    {character.age && (
                      <p className="text-sm text-gray-600">Age: {character.age}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(character)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {character.role && (
                    <div>
                      <span className="text-sm font-medium">Role: </span>
                      <span className="text-sm">{character.role}</span>
                    </div>
                  )}

                  {character.povRole && (
                    <div>
                      <span className="text-sm font-medium">POV: </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                        {POV_ROLES.find(r => r.value === character.povRole)?.label}
                      </span>
                    </div>
                  )}

                  {character.povPurposes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Purposes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {character.povPurposes.map(purpose => (
                          <span
                            key={purpose}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {POV_PURPOSES.find(p => p.value === purpose)?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {character.appearance && (
                    <div>
                      <span className="text-sm font-medium">Appearance: </span>
                      <p className="text-sm text-gray-600">{character.appearance}</p>
                    </div>
                  )}

                  {character.developmentGoals && (
                    <div>
                      <span className="text-sm font-medium">Goals: </span>
                      <p className="text-sm text-gray-600">{character.developmentGoals}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {characters.length === 0 && !isCreating && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Characters Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create character profiles to track development, POV roles, and relationships.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
          >
            <span>+</span>
            Add Your First Character
          </button>
        </div>
      )}
    </div>
  )
}