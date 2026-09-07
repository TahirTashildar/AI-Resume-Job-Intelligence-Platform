import api from './api';

export const resumeService = {
  upload: (file, label, onProgress) => {
    const formData = new FormData();
    formData.append('resume', file);
    if (label) formData.append('label', label);
    return api
      .post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => onProgress?.(Math.round((evt.loaded * 100) / evt.total)),
      })
      .then((r) => r.data.data);
  },
  list: (params) => api.get('/resumes', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/resumes/${id}`).then((r) => r.data.data),
  remove: (id) => api.delete(`/resumes/${id}`).then((r) => r.data.data),
  rename: (id, label) => api.patch(`/resumes/${id}/rename`, { label }).then((r) => r.data.data),
  activate: (id) => api.patch(`/resumes/${id}/activate`).then((r) => r.data.data),
  duplicate: (id, label) => api.post(`/resumes/${id}/duplicate`, { label }).then((r) => r.data.data),
  analyze: (id, force) => api.post(`/resumes/${id}/analyze${force ? '?force=true' : ''}`).then((r) => r.data.data),
  improve: (id, jobDescription) => api.post(`/resumes/${id}/improve`, { jobDescription }).then((r) => r.data.data),
  improveBullet: (bullet, style) => api.post('/resumes/bullet/improve', { bullet, style }).then((r) => r.data.data),
};
