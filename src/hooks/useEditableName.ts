import { useState, useEffect } from 'react'

interface UseEditableNameProps {
  name: string
  onNameChange?: (name: string) => void
}

export function useEditableName({ name, onNameChange }: UseEditableNameProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(name)

  useEffect(() => {
    setEditedName(name)
  }, [name])

  const handleNameEdit = () => {
    setIsEditingName(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value)
  }

  const handleNameBlur = () => {
    setIsEditingName(false)
    if (editedName.trim() && editedName !== name) {
      onNameChange?.(editedName.trim())
    } else {
      setEditedName(name)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditedName(name)
    }
  }

  return {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  }
}