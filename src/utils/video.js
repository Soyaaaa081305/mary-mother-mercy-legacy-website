function getYouTubeId(url) {
  const value = String(url || '').trim();
  if (!value) return null;

  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function buildEmbedUrl(videoUrl) {
  const youtubeId = getYouTubeId(videoUrl);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;

  const value = String(videoUrl || '').trim();
  if (value.includes('vimeo.com/')) {
    const id = value.split('/').filter(Boolean).pop();
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}

module.exports = {
  buildEmbedUrl
};

