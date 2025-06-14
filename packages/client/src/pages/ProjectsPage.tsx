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
import { useTranslation } from 'react-i18next';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks';
import { Project } from '../types';
import { formatDate } from '../utils';
import { toast } from 'react-hot-toast';

export default function ProjectsPage() {
  const { t } = useTranslation();
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
      toast.success(t('messages.projectCreated'));
    } catch (error: any) {
      console.error('Failed to create project:', error);
      toast.error(error.message || t('messages.error'));
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
      toast.success(t('messages.projectUpdated'));
    } catch (error: any) {
      console.error('Failed to update project:', error);
      toast.error(error.message || t('messages.error'));
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
      toast.success(t('messages.projectDeleted'));
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      toast.error(error.message || t('messages.error'));
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
          {t('projects.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          {t('projects.addProject')}
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
                      title={t('projects.editProject')}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleOpenDeleteDialog(project)}
                      title={t('projects.deleteProject')}
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
                    label={`${project._count?.tasks || 0} ${t('projects.tasksCount').toLowerCase()}`}
                    size="small"
                    variant="outlined"
                  />
                  {project.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(project.createdAt)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {projects.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {t('projects.noProjects')}
          </Typography>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? t('projects.editProject') : t('projects.createProject')}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label={t('projects.projectName')}
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label={t('projects.projectDescription')}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" mb={1}>{t('projects.projectColor')}</Typography>
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
            {t('common.cancel')}
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
              updateProjectMutation.isPending ? t('projects.updating') : t('common.update')
            ) : (
              createProjectMutation.isPending ? t('projects.creating') : t('common.create')
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
        <DialogTitle>{t('common.confirm')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('projects.deleteConfirm')} <strong>"{projectToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t('projects.deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteProjectMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            disabled={deleteProjectMutation.isPending}
            startIcon={deleteProjectMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {deleteProjectMutation.isPending ? t('projects.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 