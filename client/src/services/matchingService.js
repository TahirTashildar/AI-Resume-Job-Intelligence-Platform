import api from './api';

export const matchingService = {
  analyze: (resumeId, jobId, force) =>
    api.post(`/matching/analyze${force ? '?force=true' : ''}`, { resumeId, jobId }).then((r) => r.data.data),
  list: () => api.get('/matching').then((r) => r.data.data),
  skillGap: (resumeId, jobId) => api.post('/matching/skill-gap', { resumeId, jobId }).then((r) => r.data.data),
};
