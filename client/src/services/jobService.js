import api from './api';

export const jobService = {
  analyzeText: (jobDescription) => api.post('/jobs/analyze', { jobDescription }).then((r) => r.data.data),
  create: (payload) => api.post('/jobs', payload).then((r) => r.data.data),
  list: (params) => api.get('/jobs', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/jobs/${id}`).then((r) => r.data.data),
  update: (id, payload) => api.put(`/jobs/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data.data),
  analyze: (id, force) => api.post(`/jobs/${id}/analyze${force ? '?force=true' : ''}`).then((r) => r.data.data),
};
