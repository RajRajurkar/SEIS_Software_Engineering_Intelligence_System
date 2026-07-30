import api from './api';

const analyticsService = {
  getDashboardOverview: (analysisId) =>
    api.get(`/api/v1/analytics/overview/${analysisId}`),

  getRepositoryAnalytics: (analysisId) =>
    api.get(`/api/v1/analytics/repository/${analysisId}`),

  getContributorAnalytics: (analysisId) =>
    api.get(`/api/v1/analytics/contributors/${analysisId}`),

  getModuleAnalytics: (analysisId) =>
    api.get(`/api/v1/analytics/modules/${analysisId}`),

  getTimelineAnalytics: (analysisId) =>
    api.get(`/api/v1/analytics/timeline/${analysisId}`),
};

export default analyticsService;