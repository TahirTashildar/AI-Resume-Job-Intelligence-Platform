function freshnessScore(dateValue, fetchedAt, recency) {
  const now = new Date(fetchedAt);
  const reference = Number.isNaN(now.getTime()) ? new Date() : now;
  let date = dateValue ? new Date(dateValue) : null;
  if (dateValue && Number.isNaN(date?.getTime())) {
    const relative = String(dateValue).toLowerCase();
    if (relative === 'today') date = reference;
    else if (relative === 'yesterday') date = new Date(reference.getTime() - 24 * 36e5);
    else if (/hours? ago/.test(relative)) date = new Date(reference.getTime() - Number.parseInt(relative, 10) * 36e5);
    else if (/days? ago/.test(relative)) date = new Date(reference.getTime() - Number.parseInt(relative, 10) * 24 * 36e5);
    else if (relative === 'this week') date = new Date(reference.getTime() - 3 * 24 * 36e5);
  }
  if (!date || Number.isNaN(date.getTime())) return { score: 10, label: 'Freshness unknown', confidence: 'low' };
  const ageHours = Math.max(0, (reference.getTime() - date.getTime()) / 36e5);
  const maxHours = recency === 'Last 24 Hours' ? 24 : recency === 'Last 3 Days' ? 72 : recency === 'Last 30 Days' ? 720 : 168;
  if (ageHours > maxHours) return null;
  if (ageHours <= 24) return { score: 100, label: 'Posted today', confidence: 'high' };
  if (ageHours <= 72) return { score: 85, label: `Posted ${Math.max(1, Math.floor(ageHours / 24))} days ago`, confidence: 'high' };
  if (ageHours <= 168) return { score: 65, label: 'Posted this week', confidence: 'medium' };
  return { score: 45, label: 'Posted this month', confidence: 'medium' };
}

module.exports = { freshnessScore };
