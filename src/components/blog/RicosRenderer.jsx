import React from 'react';

/**
 * Lightweight renderer for Wix Ricos rich content JSON format.
 * Converts the richContent document returned by the Wix Blog SDK into JSX.
 * No external dependencies — works with React 18.
 */

// Convert wix:image://v1/... to wixstatic CDN URL
function resolveWixImageUrl(src, width = 1200) {
  if (!src) return null;
  // If it's an object with url or id
  const uri = typeof src === 'string' ? src : (src?.url || src?.id || null);
  if (!uri) return null;
  if (uri.startsWith('http')) return uri;
  const withoutProto = uri.replace('wix:image://v1/', '');
  const fileId = withoutProto.split('/')[0].split('#')[0];
  if (!fileId) return null;
  return `https://static.wixstatic.com/media/${fileId}/v1/fill/w_${width},al_c,q_90,usm_0.33_1.00_0.00/file.jpg`;
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
      // Check if paragraph is empty
      const isEmpty = (node.nodes || []).every(n => !n.textData?.text?.trim());
      if (isEmpty) return <br key={key} />;
      return <p key={key}>{children}</p>;
    }

    case 'HEADING_ONE':
      return <h1 key={key}>{renderInlineChildren(node.nodes || [])}</h1>;
    case 'HEADING_TWO':
      return <h2 key={key}>{renderInlineChildren(node.nodes || [])}</h2>;
    case 'HEADING_THREE':
      return <h3 key={key}>{renderInlineChildren(node.nodes || [])}</h3>;
    case 'HEADING_FOUR':
      return <h4 key={key}>{renderInlineChildren(node.nodes || [])}</h4>;
    case 'HEADING_FIVE':
      return <h5 key={key}>{renderInlineChildren(node.nodes || [])}</h5>;
    case 'HEADING_SIX':
      return <h6 key={key}>{renderInlineChildren(node.nodes || [])}</h6>;

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
            // List items wrap paragraphs — unwrap them
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
      const imgData = node.imageData || {};
      const src = imgData.image?.src;
      const imgUrl = resolveWixImageUrl(src, 1200);
      const alt = imgData.altText || imgData.image?.src?.id || '';
      const caption = imgData.caption;
      if (!imgUrl) return null;
      return (
        <figure key={key}>
          <img src={imgUrl} alt={alt} loading="lazy" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }

    case 'VIDEO': {
      // For embedded videos, show a placeholder link
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

    case 'GALLERY': {
      // Render gallery images in a grid
      const items = node.galleryData?.items || [];
      if (items.length === 0) return null;
      return (
        <div key={key} className="ricos-gallery">
          {items.map((item, i) => {
            const imgUrl = resolveWixImageUrl(item.image?.media?.src, 800);
            if (!imgUrl) return null;
            return (
              <figure key={i} className="ricos-gallery-item">
                <img src={imgUrl} alt={item.title || ''} loading="lazy" />
              </figure>
            );
          })}
        </div>
      );
    }

    case 'LINK_PREVIEW': {
      const preview = node.linkPreviewData || {};
      return (
        <a key={key} href={preview.url || '#'} target="_blank" rel="noopener noreferrer" className="ricos-link-preview">
          <strong>{preview.title}</strong>
          {preview.description && <span>{preview.description}</span>}
        </a>
      );
    }

    case 'TEXT':
      // Standalone text nodes (edge case)
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
