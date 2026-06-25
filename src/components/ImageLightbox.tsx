import { useEffect } from 'react';

interface ImageLightboxProps {
  urls: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImageLightbox({ urls, index, alt, onClose, onNavigate }: ImageLightboxProps) {
  const hasPrev = index > 0;
  const hasNext = index < urls.length - 1;
  const src = urls[index];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1);
      if (event.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  if (!src) return null;

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="image-lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <span className="image-lightbox-counter">
          {urls.length > 1 ? `${index + 1} / ${urls.length}` : ''}
        </span>
        <button type="button" className="image-lightbox-close" onClick={onClose} aria-label="关闭">
          ×
        </button>
      </div>

      {hasPrev ? (
        <button
          type="button"
          className="image-lightbox-nav image-lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          aria-label="上一张"
        >
          ‹
        </button>
      ) : null}

      <img
        className="image-lightbox-img"
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />

      {hasNext ? (
        <button
          type="button"
          className="image-lightbox-nav image-lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
          aria-label="下一张"
        >
          ›
        </button>
      ) : null}
    </div>
  );
}
