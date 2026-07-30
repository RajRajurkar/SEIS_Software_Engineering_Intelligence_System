import api from './api';

const aiService = {
  getSummary: (analysisId) =>
    api.get(`/api/v1/ai/${analysisId}/summary`),

  askQuestion: (analysisId, question) =>
    api.post(`/api/v1/ai/${analysisId}/chat`, { question }),

  getInsights: (analysisId) =>
    api.get(`/api/v1/ai/${analysisId}/insights`),
};

export default aiService;