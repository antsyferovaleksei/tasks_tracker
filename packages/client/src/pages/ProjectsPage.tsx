import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks';
import { Project } from '../types';
import { formatDate } from '../utils';

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#2196f3',
    archived: false,
  });

  const { projects = [], isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      return;
    }

    console.log('Creating project:', newProject);
    console.log('Access token:', localStorage.getItem('accessToken'));

    try {
      const result = await createProjectMutation.mutateAsync(newProject);
      console.log('Project created successfully:', result);
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to create project:', error);
      // Error is handled by the mutation's onError
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !newProject.name.trim()) {
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({
        id: editingProject.id,
        data: newProject,
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) {
      return;
    }

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleOpenEditDialog = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      description: project.description || '',
      color: project.color || '#2196f3',
      archived: project.archived || false,
    });
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setNewProject({
      name: '',
      description: '',
      color: '#2196f3',
      archived: false,
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Проекти
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Додати проект
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project: Project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card
              sx={{
                borderLeft: `4px solid ${project.color}`,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FolderIcon sx={{ color: project.color }} />
                    <Typography variant="h6" component="h3">
                      {project.name}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEditDialog(project)}
                      title="Редагувати проект"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleOpenDeleteDialog(project)}
                      title="Видалити проект"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {project.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {project.description}
                  </Typography>
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={`${project._count?.tasks || 0} завдань`}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(project.createdAt)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {projects.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            Проекти не знайдено
          </Typography>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? 'Редагувати проект' : 'Створити проект'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Назва проекту"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Опис"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" mb={1}>Колір проекту</Typography>
              <input
                type="color"
                value={newProject.color}
                onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '4px' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
          >
            Скасувати
          </Button>
          <Button
            onClick={editingProject ? handleUpdateProject : handleCreateProject}
            variant="contained"
            disabled={
              !newProject.name.trim() || 
              createProjectMutation.isPending || 
              updateProjectMutation.isPending
            }
            startIcon={
              (createProjectMutation.isPending || updateProjectMutation.isPending) ? 
              <CircularProgress size={20} /> : null
            }
          >
            {editingProject ? (
              updateProjectMutation.isPending ? 'Оновлення...' : 'Оновити'
            ) : (
              createProjectMutation.isPending ? 'Створення...' : 'Створити'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <Typography>
            Ви впевнені, що хочете видалити проект <strong>"{projectToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ця дія незворотна. Всі завдання в цьому проекті також будуть видалені.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteProjectMutation.isPending}
          >
            Скасувати
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            disabled={deleteProjectMutation.isPending}
            startIcon={deleteProjectMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {deleteProjectMutation.isPending ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 