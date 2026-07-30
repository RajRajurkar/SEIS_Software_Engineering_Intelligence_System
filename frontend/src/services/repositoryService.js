import api from './api';

const repositoryService = {
  analyzeRepository: (githubUrl) =>
    api.post('/api/v1/repositories/analyze', { github_url: githubUrl }),

  getStatus: (analysisId) =>
    api.get(`/api/v1/repositories/${analysisId}/status`),

  getRepository: (analysisId) =>
    api.get(`/api/v1/repositories/${analysisId}`),

  getAllRepositories: () =>
    api.get('/api/v1/repositories/'),

  deleteRepository: (analysisId) =>
    api.delete(`/api/v1/repositories/${analysisId}`),
};

export default repositoryService;