import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImageLightbox from './ImageLightbox';
import { extractImageUrls } from '../utils/markdownImages';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const imageUrls = useMemo(() => extractImageUrls(content), [content]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (src: string | undefined) => {
    if (!src) return;
    const index = imageUrls.indexOf(src);
    setLightboxIndex(index >= 0 ? index : 0);
  };

  return (
    <>
      <div className="md-preview">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt, ...props }) => (
              <img
                {...props}
                src={src}
                alt={alt ?? ''}
                className="md-preview-img"
                loading="lazy"
                onClick={() => openLightbox(src)}
                title="点击查看大图"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {lightboxIndex !== null && imageUrls.length > 0 ? (
        <ImageLightbox
          urls={imageUrls}
          index={lightboxIndex}
          alt=""
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
