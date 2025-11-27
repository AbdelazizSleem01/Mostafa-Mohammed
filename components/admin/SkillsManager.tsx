'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Swal from 'sweetalert2'

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  order: z.number().min(0).optional()
})

type Skill = z.infer<typeof skillSchema> & { _id?: string }

export default function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<Skill>({
    resolver: zodResolver(skillSchema)
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      setSkills(data)
    } catch (error) {
      console.error('Error fetching skills:', error)
    }
  }

  const onSubmit = async (data: Skill) => {
    try {
      if (editingSkill) {
        await fetch(`/api/skills/${editingSkill._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        Swal.fire('Updated!', 'Skill updated successfully', 'success')
      } else {
        await fetch('/api/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        Swal.fire('Created!', 'Skill created successfully', 'success')
      }
      reset()
      setEditingSkill(null)
      fetchSkills()
    } catch (error) {
      Swal.fire('Error!', 'Failed to save skill', 'error')
    }
  }

  const deleteSkill = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6F4E37',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        await fetch(`/api/skills/${id}`, { method: 'DELETE' })
        Swal.fire('Deleted!', 'Skill has been deleted.', 'success')
        fetchSkills()
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete skill', 'error')
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="card bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingSkill ? 'Edit Skill' : 'Add New Skill'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">Skill Name</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="input input-bordered w-full"
              placeholder="e.g., Latte Art"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Display Order</span>
            </label>
            <input
              type="number"
              {...register('order', { valueAsNumber: true })}
              className="input input-bordered w-full"
              placeholder="Optional"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn btn-primary">
            {editingSkill ? 'Update' : 'Add'} Skill
          </button>
          {editingSkill && (
            <button
              type="button"
              onClick={() => {
                setEditingSkill(null)
                reset()
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Skills List</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill._id}>
                    <td>{skill.name}</td>
                    <td>{skill.order || 0}</td>
                    <td className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingSkill(skill)
                          reset(skill)
                        }}
                        className="btn btn-sm btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSkill(skill._id!)}
                        className="btn btn-sm btn-error"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}