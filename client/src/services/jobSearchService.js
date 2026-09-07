import api from './api';

export const jobSearchService = {
  profile: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/job-search/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((response) => response.data.data);
  },
  search: (profile, preferences) =>
    api.post('/job-search/search', { profile, preferences }).then((response) => response.data.data),
  save: (job) =>
    api.post('/job-search/save', { job }).then((response) => response.data.data),
};
