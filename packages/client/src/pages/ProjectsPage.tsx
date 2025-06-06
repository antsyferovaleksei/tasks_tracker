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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useProjects, useCreateProject } from '../hooks';
import { Project } from '../types';
import { formatDate } from '../utils';

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#2196f3',
    archived: false,
  });

  const { projects = [], isLoading } = useProjects();
  const createProjectMutation = useCreateProject();

  const handleCreateProject = () => {
    createProjectMutation.mutate(newProject, {
      onSuccess: () => {
        setDialogOpen(false);
        setNewProject({
          name: '',
          description: '',
          color: '#2196f3',
          archived: false,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography>Завантаження...</Typography>
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
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
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

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Створити проект</DialogTitle>
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
          <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProject.name}
          >
            Створити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 