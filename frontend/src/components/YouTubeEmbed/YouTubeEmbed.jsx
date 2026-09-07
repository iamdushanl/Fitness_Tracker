import './YouTubeEmbed.css';

/**
 * Responsive YouTube video embed.
 * Props:
 *   url   — full YouTube URL (watch or embed)
 *   title — accessible title for the iframe
 */
export default function YouTubeEmbed({ url, title = 'Exercise demonstration' }) {
  if (!url) return null;

  // Extract video ID from various YouTube URL formats
  let videoId = '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.slice(1);
    } else {
      videoId = parsed.searchParams.get('v') || parsed.pathname.split('/embed/')[1] || '';
    }
  } catch {
    return null;
  }

  if (!videoId) return null;

  return (
    <div className="youtube-embed-container">
      <div className="youtube-embed" id="youtube-embed">
        <iframe
          className="youtube-embed__iframe"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="youtube-embed__fallback">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="youtube-embed__fallback-link"
        >
          Watch on YouTube ↗
        </a>
      </div>
    </div>
  );
}
