import type { Episode } from '@/content/types';
import { getResource } from '@/content/resources';
import { formatDate, pad } from '@/content/episodes';
import { EXECUTIVE_BRIEFS } from '@/content/executive-briefs';
import metrics from './deck-font-metrics.json';
import logo from '@/assets/codeshift-logo.png.asset.json';

export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;
export type FontRole = 'title' | 'body' | 'mono';
export type Ink = 'background' | 'foreground' | 'muted' | 'primary' | 'teal' | 'panel' | 'border';
export type Primitive =
 | { kind: 'text'; x: number; y: number; width: number; size: number; font: FontRole; ink: Ink; lines: string[] }
 | { kind: 'rect'; x: number; y: number; width: number; height: number; ink: Ink }
 | { kind: 'image'; x: number; y: number; width: number; height: number; src: string }
 | { kind: 'link'; x: number; y: number; width: number; height: number; url: string; label: string };
export interface DeckEntry { title: string; body: string; url?: string; meta?: string }
export interface DeckSlide {
 id: string; section: string; part: 'summary' | 'resources'; title: string; entries: DeckEntry[];
 subtitle?: string; image?: string; layout?: 'cover' | 'statement' | 'comparison' | 'matrix' | 'flow' | 'map' | 'directory';
 objective?: string; topics?: string; packageId?: string; aliases?: string[]; nodes: Primitive[];
}
export function wrapText(value: string, width: number, size: number, font: FontRole): string[] {
 const map = metrics[font] as Record<string, number>;
 const measure = (s: string) => Array.from(s).reduce((n, c) => n + (map[c] ?? .6) * size, 0);
 const lines: string[] = [];
 for (const paragraph of value.split('\n')) {
  let line = '';
  for (const word of paragraph.split(/\s+/).filter(Boolean)) {
   const next = line ? `${line} ${word}` : word;
   if (line && measure(next) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
 }
 return lines;
}
function layoutSlide(s: DeckSlide, ep: Episode, index: number, total: number): Primitive[] {
 const nodes: Primitive[] = [];
 const rect = (x: number,y: number,width: number,height: number,ink: Ink) => nodes.push({kind:'rect',x,y,width,height,ink});
 const text = (value: string,x: number,y: number,width: number,size=40,font: FontRole='body',ink: Ink='foreground') => {
  const lines=wrapText(value,width,size,font); nodes.push({kind:'text',x,y,width,size,font,ink,lines}); return lines.length*size*1.3;
 };
 const link = (url: string,label: string,x: number,y: number,width: number,height: number) => nodes.push({kind:'link',url,label,x,y,width,height});
 rect(0,0,1920,1080,'background');
 nodes.push({kind:'image',x:56,y:26,width:54,height:54,src:logo.url});
 text(`CodeShift / EP${pad(ep.number)}`,130,36,850,26,'mono','muted');
 text(s.part==='resources'?'B / RESOURCES & REFERENCES':'A / EXECUTIVE BRIEF',1230,36,634,26,'mono','teal');
 rect(56,100,1808,2,'border');
 text(s.section.toUpperCase(),56,128,1808,26,'mono','teal');
 if(s.layout==='cover') {
  const h=text(ep.shortTitle,56,235,1000,88,'title');
  text('Executive Episode Brief',56,255+h,970,42,'body','muted');
  text(`${formatDate(ep.scheduledDate)}\nHany Saad & Ahmed Mamdoh`,56,676,990,34,'body','muted');
  rect(56,844,760,88,'primary'); text('Watch Full Episode >',90,863,692,40,'title');
  link(ep.youtubeUrl,'Watch Full Episode',56,844,760,88);
  if(s.image) nodes.push({kind:'image',x:1110,y:285,width:754,height:480,src:s.image});
 } else {
  const titleHeight=text(s.title,56,190,1808,s.layout==='directory'?58:68,'title');
  let start=190+titleHeight+32;
  if(s.layout==='directory') {
   const left=s.packageId?520:0, gap=s.packageId?54:0;
   if(s.packageId) {
    text('LEARNING OBJECTIVE',56,start,520,26,'mono','teal');
    let y=start+52; y+=text(s.objective??'',56,y,520,42,'title')+44;
    text('WHAT TO LEARN',56,y,520,26,'mono','teal'); y+=52;
    text(s.topics??'',56,y,520,36,'body','muted');
    rect(594,start,2,970-start,'border');
   }
   const x0=56+left+gap, available=1808-left-gap;
   const columns=s.entries.length>5?2:1, colWidth=(available-(columns-1)*36)/columns;
   const rows=Math.ceil(s.entries.length/columns), rowHeight=(968-start)/Math.max(rows,1);
   s.entries.forEach((e,i)=>{
    const col=Math.floor(i/rows),row=i%rows,x=x0+col*(colWidth+36),y=start+row*rowHeight;
    const h=text(`${e.title} >`,x,y,colWidth, s.entries.length>8?32:36,'title', 'teal');
    // One concise metadata line avoids overlapping provider/access labels in dense directories.
    text([e.body,e.meta].filter(Boolean).join(' · '),x,y+h+10,colWidth,28,'body','muted');
    rect(x,y+rowHeight-10,colWidth,1,'border');
    if(e.url)link(e.url,e.title,x,y,colWidth,rowHeight-10);
   });
  } else {
   if(s.subtitle) start+=text(s.subtitle,56,start,1760,34,'body','muted')+30;
   const bottom=966,available=bottom-start;
   if(s.layout==='statement') {
    const rh=available/s.entries.length;
    s.entries.forEach((e,i)=>{const y=start+i*rh; text(String(i+1).padStart(2,'0'),56,y+4,90,42,'mono','teal');
     const h=text(e.title,178,y,1650,48,'title'); text(e.body,178,y+h+14,1620,40,'body','muted');
     if(i<s.entries.length-1)rect(178,y+rh-22,1650,1,'border');
    });
   } else if(s.layout==='comparison') {
    const width=852;
    s.entries.forEach((e,i)=>{const x=56+i*956;rect(x,start,80,6,i?'teal':'primary');
     const h=text(e.title,x,start+38,width,52,'title',i?'teal':'foreground');
     let y=start+60+h; e.body.split('\n').forEach(line=>{y+=text(line,x,y,width,44,'body','muted')+36;});
    });
    rect(956,start,2,available,'border');
   } else if(s.layout==='flow') {
    const width=(1808-(s.entries.length-1)*40)/s.entries.length;
    rect(56,start+60,1808,4,'primary');
    s.entries.forEach((e,i)=>{const x=56+i*(width+40);rect(x,start+30,80,60,'background');text(String(i+1).padStart(2,'0'),x,start+36,width,40,'mono','teal');
     const h=text(e.title,x,start+120,width,46,'title'); text(e.body,x,start+146+h,width,40,'body','muted');
    });
   } else {
    const columns=s.layout==='map'?3: s.entries.length===3?3:2;
    const rows=Math.ceil(s.entries.length/columns), width=(1808-(columns-1)*48)/columns, height=(available-(rows-1)*36)/rows;
    s.entries.forEach((e,i)=>{const x=56+(i%columns)*(width+48),y=start+Math.floor(i/columns)*(height+36);
     rect(x,y,72,5,i%2?'primary':'teal');const h=text(e.title,x,y+30,width,s.layout==='map'?40:46,'title');
     text(e.body,x,y+50+h,width,s.layout==='map'?36:40,'body','muted');
    });
   }
  }
 }
 text('Think Beyond the Code.',56,1016,1200,24,'mono','muted');
 text(`${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,1640,1016,224,24,'mono','muted');
 rect(0,1074,1920,6,'primary'); return nodes;
}
export function buildDeck(ep: Episode): DeckSlide[] {
 const slides: DeckSlide[]=[];
 const add=(s: Omit<DeckSlide,'nodes'>)=>slides.push({...s,nodes:[]});
 add({id:'cover',title:ep.shortTitle,section:`Episode ${pad(ep.number)}`,part:'summary',layout:'cover',image:ep.thumbnail,entries:[]});
 const pages=EXECUTIVE_BRIEFS[ep.id];
 if(pages) pages.forEach(p=>add({...p,part:'summary', entries:p.layout==='map'?(ep.brief?.packages??[]).map(e=>({title:`${e.id} / ${e.name.replace(' — Optional','')}${e.id==='P06'?' (Optional)':''}`,body:e.outcome})):p.entries}));
 else {
  add({id:'summary',title:'Episode in 60 seconds',section:'Core lessons',part:'summary',layout:'statement',entries:ep.takeaways.slice(0,3).map(title=>({title,body:''}))});
  add({id:'actions',title:'Your next practical steps',section:'Action items',part:'summary',layout:'matrix',entries:ep.actionItems.map((body,i)=>({title:`${i+1} / Take action`,body}))});
 }
 const seen=new Set<string>();
 const entry=(r:{title:string;provider:string;url:string;access?:string;ref?:string}):DeckEntry=>({title:`${r.ref?`${r.ref} / `:''}${r.title}`,body:r.provider,url:r.url,...(r.access?{meta:r.access}:{})});
 const groups=ep.brief?.resourceGroups??[];
 const extra:DeckEntry[]=[];
 if(ep.brief?.packages) groups.forEach((g,i)=>{
  const entries=g.items.filter(r=>{if(seen.has(r.url))return false;seen.add(r.url);return true;}).map(entry);
  const pkg=ep.brief?.packages?.[i];
  if(pkg)add({id:`resources-${i+1}`,title:`${pkg.id} — ${pkg.name}`,section:pkg.id==='P06'?'Optional specialization':'Learning resources',part:'resources',layout:'directory',packageId:pkg.id,objective:pkg.outcome,topics:pkg.topics,entries});
  else extra.push(...entries);
 });
 else groups.forEach(g=>g.items.forEach(r=>{if(!seen.has(r.url)){seen.add(r.url);extra.push(entry(r));}}));
 ep.resourceIds.forEach(id=>{const r=getResource(id);if(r&&!seen.has(r.url)){seen.add(r.url);extra.push({title:r.title,body:r.provider,url:r.url,meta:r.level});}});
 ep.brief?.caseStudy?.links.forEach(r=>{if(!seen.has(r.url)){seen.add(r.url);extra.push({title:r.label,body:'WorxForge',url:r.url,meta:'Reference'});}});
 if(ep.brief?.packages) {
  if(extra.length)add({id:'references',title:'Engineering & adoption references',section:'Further reading',part:'resources',layout:'directory',entries:extra});
 } else {
  const split=Math.ceil(extra.length/2);
  [extra.slice(0,split),extra.slice(split)].forEach((entries,i)=>{if(entries.length)add({id:i?'references':'resources-1',title:i?'AI workflows & engineering references':'Foundations & practical development',section:'Learning resources',part:'resources',layout:'directory',entries});});
 }
 slides.forEach((s,i)=>{s.aliases=legacyAliases(s);s.nodes=layoutSlide(s,ep,i,slides.length);});return slides;
}
function legacyAliases(s:DeckSlide):string[] {
 const aliases:Record<string,string[]>={summary:['summary-2','lessons','lessons-2'],actions:['takeaways','practice','practice-2','actions-2','closing','learning-loop'],packages:['packages-2'],adoption:['playbook-90','adoption-measures'], 'career-levels':['levels','career-levels-2','agentic'], 'case-study':['case-study-2'],references:['references-2','references-3','worxforge-links','resource-note','resources-7']};
 if(s.packageId){const n=s.packageId.slice(-1);return [`resources-${n}-2`,`resources-${n}-3`,`resources-${n}-4`];}
 return aliases[s.id]??[];
}
export function slideIndex(slides:DeckSlide[],id?:string){const exact=slides.findIndex(s=>s.id===id);if(exact>=0)return exact;const alias=slides.findIndex(s=>s.aliases?.includes(id??''));return alias<0?0:alias;}
export function boundedSlide(index:number,total:number){return Math.max(0,Math.min(total-1,index));}
