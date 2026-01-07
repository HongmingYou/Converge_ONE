import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProjectData } from '@/types/project';
import { MOCK_PROJECTS } from '@/data/mockProject';

interface ProjectContextType {
  projects: ProjectData[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectData[]>>;
  addProject: (project: ProjectData) => void;
  updateProject: (projectId: string, updates: Partial<ProjectData>) => void;
  getProject: (projectId: string) => ProjectData | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectData[]>(MOCK_PROJECTS);

  const addProject = (project: ProjectData) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (projectId: string, updates: Partial<ProjectData>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, ...updates, lastModified: new Date() } : p
    ));
  };

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      setProjects,
      addProject,
      updateProject,
      getProject,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

