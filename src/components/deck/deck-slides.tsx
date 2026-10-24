import type { Episode } from '@/content/types';
import { buildDeck, type DeckSlide } from '@/lib/deck-model';
export { buildDeck, type DeckSlide };

export function SlideFrame({ ep, slide, index, total }: { ep: Episode; slide: DeckSlide; index: number; total: number }) {
  return <svg className="deck-slide" viewBox="0 0 1920 1080" width="1920" height="1080" role="img" aria-label={`EP${ep.number}: ${slide.title}, slide ${index + 1} of ${total}`}>
    {slide.nodes.map((node, i) => {
      if (node.kind === 'rect') return <rect key={i} x={node.x} y={node.y} width={node.width} height={node.height} fill={`var(--deck-${node.ink})`} />;
      if (node.kind === 'image') return <image key={i} href={node.src} x={node.x} y={node.y} width={node.width} height={node.height} preserveAspectRatio="xMidYMid meet" />;
      if (node.kind === 'link') return <a key={i} href={node.url} target="_blank" rel="noopener noreferrer" aria-label={node.label}><rect x={node.x} y={node.y} width={node.width} height={node.height} fill="transparent" className="deck-link-target" /></a>;
      return <text key={i} x={node.x} y={node.y} fill={`var(--deck-${node.ink})`} fontSize={node.size} fontFamily={`Deck${node.font}`} dominantBaseline="hanging">{node.lines.map((line, j) => <tspan key={j} x={node.x} dy={j ? node.size * 1.3 : 0}>{line || ' '}</tspan>)}</text>;
    })}
  </svg>;
}
