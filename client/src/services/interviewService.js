import api from './api';

export const interviewService = {
  generate: (resumeId, jobId) => api.post('/interview/generate', { resumeId, jobId }).then((r) => r.data.data),
};
