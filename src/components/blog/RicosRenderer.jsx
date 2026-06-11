import React from 'react';

/**
 * Lightweight renderer for Wix Ricos rich content JSON format.
 * Converts the richContent document returned by the Wix Blog SDK into JSX.
 * No external dependencies — works with React 18.
 */

// Convert wix:image://v1/... or { id } to wixstatic CDN URL
// Uses direct CDN URL (no /v1/fill/ transforms) to avoid 400 errors on .avif/.webp
function resolveWixImageUrl(src) {
  if (!src) return null;

  // Extract a string URI from various possible structures
  let uri = null;
  if (typeof src === 'string') {
    uri = src;
  } else if (src?.url) {
    uri = src.url;
  } else if (src?.id) {
    uri = src.id;
  }

  if (!uri) return null;

  // Already a full CDN URL
  if (uri.startsWith('https://') || uri.startsWith('http://')) return uri;

  // wix:image://v1/<fileId>/... format
  if (uri.startsWith('wix:image://')) {
    const withoutProto = uri.replace('wix:image://v1/', '');
    const fileId = withoutProto.split('/')[0].split('#')[0];
    if (!fileId) return null;
    return `https://static.wixstatic.com/media/${fileId}`;
  }

  // Bare file ID (e.g. "45119e_abc123~mv2.avif")
  const fileId = uri.split('/')[0].split('#')[0];
  if (!fileId) return null;
  return `https://static.wixstatic.com/media/${fileId}`;
}

// Apply text decorations (bold, italic, underline, link, etc.) to a string
function renderTextWithDecorations(text, decorations = []) {
  let content = <>{text}</>;

  for (const decoration of decorations) {
    switch (decoration.type) {
      case 'BOLD':
        content = <strong>{content}</strong>;
        break;
      case 'ITALIC':
        content = <em>{content}</em>;
        break;
      case 'UNDERLINE':
        content = <u>{content}</u>;
        break;
      case 'STRIKETHROUGH':
        content = <s>{content}</s>;
        break;
      case 'LINK': {
        const href = decoration.linkData?.link?.url || decoration.linkData?.url || '#';
        const target = decoration.linkData?.link?.target === 'BLANK' ? '_blank' : '_self';
        content = <a href={href} target={target} rel="noopener noreferrer">{content}</a>;
        break;
      }
      case 'COLOR': {
        const color = decoration.colorData?.foreground;
        if (color) content = <span style={{ color }}>{content}</span>;
        break;
      }
      default:
        break;
    }
  }

  return content;
}

// Render a TEXT node
function renderTextNode(node, key) {
  const { text = '', decorations = [] } = node.textData || {};
  if (!text) return null;
  return (
    <React.Fragment key={key}>
      {renderTextWithDecorations(text, decorations)}
    </React.Fragment>
  );
}

// Render child nodes inline (for paragraphs, headings, list items, etc.)
function renderInlineChildren(nodes = []) {
  return nodes.map((child, i) => {
    if (child.type === 'TEXT') return renderTextNode(child, i);
    // Nested inline: MENTION, EMOJI, etc. — just render the text portion
    if (child.textData?.text) return <React.Fragment key={i}>{child.textData.text}</React.Fragment>;
    return null;
  });
}

// Main node renderer
function renderNode(node, key) {
  if (!node || !node.type) return null;

  switch (node.type) {
    case 'PARAGRAPH': {
      const children = renderInlineChildren(node.nodes || []);
      const isEmpty = (node.nodes || []).every(n => !n.textData?.text?.trim());
      if (isEmpty) return <br key={key} />;
      return <p key={key}>{children}</p>;
    }

    // Wix uses a single HEADING type with headingData.level (1-6)
    case 'HEADING': {
      const level = node.headingData?.level || 2;
      const children = renderInlineChildren(node.nodes || []);
      const Tag = `h${Math.min(Math.max(level, 1), 6)}`;
      return React.createElement(Tag, { key }, children);
    }

    // Keep legacy heading names as fallback just in case
    case 'HEADING_ONE':   return <h1 key={key}>{renderInlineChildren(node.nodes || [])}</h1>;
    case 'HEADING_TWO':   return <h2 key={key}>{renderInlineChildren(node.nodes || [])}</h2>;
    case 'HEADING_THREE': return <h3 key={key}>{renderInlineChildren(node.nodes || [])}</h3>;
    case 'HEADING_FOUR':  return <h4 key={key}>{renderInlineChildren(node.nodes || [])}</h4>;
    case 'HEADING_FIVE':  return <h5 key={key}>{renderInlineChildren(node.nodes || [])}</h5>;
    case 'HEADING_SIX':   return <h6 key={key}>{renderInlineChildren(node.nodes || [])}</h6>;

    case 'BULLETED_LIST':
      return (
        <ul key={key}>
          {(node.nodes || []).map((item, i) => renderNode(item, i))}
        </ul>
      );

    case 'ORDERED_LIST':
      return (
        <ol key={key}>
          {(node.nodes || []).map((item, i) => renderNode(item, i))}
        </ol>
      );

    case 'LIST_ITEM':
      return (
        <li key={key}>
          {(node.nodes || []).map((child, i) => {
            if (child.type === 'PARAGRAPH') {
              return <React.Fragment key={i}>{renderInlineChildren(child.nodes || [])}</React.Fragment>;
            }
            return renderNode(child, i);
          })}
        </li>
      );

    case 'BLOCKQUOTE': {
      const quoteChildren = (node.nodes || []).map((child, i) => {
        if (child.type === 'PARAGRAPH') {
          return <React.Fragment key={i}>{renderInlineChildren(child.nodes || [])}</React.Fragment>;
        }
        return renderNode(child, i);
      });
      return <blockquote key={key}>{quoteChildren}</blockquote>;
    }

    case 'CODE_BLOCK': {
      const codeText = (node.nodes || [])
        .filter(n => n.type === 'PARAGRAPH')
        .flatMap(p => (p.nodes || []).filter(n => n.type === 'TEXT').map(n => n.textData?.text || ''))
        .join('\n');
      return (
        <pre key={key}>
          <code>{codeText}</code>
        </pre>
      );
    }

    case 'IMAGE': {
      // ImageData.image is V1Media { src: FileSource { url, id }, width, height }
      const imgData = node.imageData || {};
      const mediaSrc = imgData.image?.src;   // FileSource { url?, id? }
      const imgUrl = resolveWixImageUrl(mediaSrc);
      const alt = imgData.altText || '';
      console.log('[RicosRenderer] IMAGE src:', JSON.stringify(mediaSrc), '-> url:', imgUrl);
      if (!imgUrl) return null;
      return (
        <figure key={key}>
          <img src={imgUrl} alt={alt} loading="lazy" />
        </figure>
      );
    }

    // Caption is a separate node that follows IMAGE in Wix Ricos
    case 'CAPTION': {
      const text = renderInlineChildren(node.nodes || []);
      return <figcaption key={key}>{text}</figcaption>;
    }

    case 'VIDEO': {
      const videoUrl = node.videoData?.video?.src?.url;
      if (!videoUrl) return null;
      return (
        <div key={key} className="ricos-video-wrapper">
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="ricos-video-link">
            ▶ {videoUrl}
          </a>
        </div>
      );
    }

    case 'DIVIDER':
      return <hr key={key} className="ricos-divider" />;

    case 'GIF': {
      const gifUrl = node.gifData?.original?.gif || node.gifData?.downsized?.gif;
      if (!gifUrl) return null;
      return (
        <figure key={key}>
          <img src={gifUrl} alt="gif" loading="lazy" />
        </figure>
      );
    }

    case 'GALLERY': {
      // GalleryData.items: Item[] where Item.image: Image { media: V1Media { src: FileSource } }
      const items = node.galleryData?.items || [];
      if (items.length === 0) return null;
      return (
        <div key={key} className="ricos-gallery">
          {items.map((item, i) => {
            // Item.image.media.src = FileSource { url, id }
            const mediaSrc = item.image?.media?.src || item.image?.src || item.video?.thumbnail?.src;
            const imgUrl = resolveWixImageUrl(mediaSrc);
            if (!imgUrl) return null;
            return (
              <figure key={i} className="ricos-gallery-item">
                <img src={imgUrl} alt={item.altText || item.title || ''} loading="lazy" />
              </figure>
            );
          })}
        </div>
      );
    }

    case 'LINK_PREVIEW': {
      const preview = node.linkPreviewData || {};
      const href = preview.link?.url || '#';
      return (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="ricos-link-preview">
          {preview.thumbnailUrl && <img src={preview.thumbnailUrl} alt={preview.title || ''} />}
          <strong>{preview.title}</strong>
          {preview.description && <span>{preview.description}</span>}
        </a>
      );
    }

    case 'HTML': {
      const html = node.htmlData?.html || '';
      if (!html) return null;
      return <div key={key} dangerouslySetInnerHTML={{ __html: html }} />;
    }

    case 'TEXT':
      return renderTextNode(node, key);

    default:
      // Unknown node — try to render children recursively
      if (node.nodes && node.nodes.length > 0) {
        return (
          <React.Fragment key={key}>
            {node.nodes.map((child, i) => renderNode(child, i))}
          </React.Fragment>
        );
      }
      return null;
  }
}


/**
 * RicosRenderer — renders a Wix Ricos richContent document as JSX.
 * Props:
 *   content: object — the richContent object from Wix Blog SDK
 *   fallback: string — plain text fallback if content is unavailable
 */
export function RicosRenderer({ content, fallback = '' }) {
  // No content — show fallback
  if (!content) {
    if (!fallback) return null;
    return <p>{fallback}</p>;
  }

  // Ricos document has a `nodes` array at the root
  const nodes = content.nodes || [];

  if (nodes.length === 0) {
    if (!fallback) return null;
    return <p>{fallback}</p>;
  }

  return (
    <>
      {nodes.map((node, i) => renderNode(node, i))}
    </>
  );
}

export default RicosRenderer;
