import { Project, User } from './types'
import { initialProjects, mockUsers } from './mock-data'

const PROJECTS_KEY = 'la_projects_v1'
const USER_KEY = 'la_current_user'

export function getStoredProjects(): Project[] {
  if (typeof window === 'undefined') return initialProjects
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (!raw) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects))
      return initialProjects
    }
    return JSON.parse(raw) as Project[]
  } catch {
    return initialProjects
  }
}

export function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function storeUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function resetData(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects))
}

export { mockUsers }
