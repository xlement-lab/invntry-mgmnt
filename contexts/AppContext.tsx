'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User, Project } from '@/lib/types'
import { getStoredProjects, saveProjects, getStoredUser, storeUser } from '@/lib/store'

interface AppContextType {
  currentUser: User | null
  projects: Project[]
  login: (user: User) => void
  logout: () => void
  createProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  getProject: (id: string) => Project | undefined
  isLoading: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = getStoredUser()
    const storedProjects = getStoredProjects()
    setCurrentUser(user)
    setProjects(storedProjects)
    setIsLoading(false)
  }, [])

  const login = useCallback((user: User) => {
    storeUser(user)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    storeUser(null)
    setCurrentUser(null)
  }, [])

  const createProject = useCallback((project: Project) => {
    setProjects(prev => {
      const updated = [...prev, project]
      saveProjects(updated)
      return updated
    })
  }, [])

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
      saveProjects(updated)
      return updated
    })
  }, [])

  const getProject = useCallback(
    (id: string) => projects.find(p => p.id === id),
    [projects]
  )

  return (
    <AppContext.Provider value={{
      currentUser, projects, login, logout,
      createProject, updateProject, getProject, isLoading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
