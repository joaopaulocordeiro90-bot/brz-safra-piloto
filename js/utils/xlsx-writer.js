
/* ═══════════ BRZ SAFRA s29 · exportação Excel (.xlsx) nativa ═══════════
   Monta o pacote Office Open XML no navegador (planilhas, estilos, cabeçalho congelado, filtro)
   e compacta com CompressionStream (deflate) quando disponível. Sem biblioteca externa, offline.
   Uso: BRZXLSX.download('arquivo.xlsx',[{name,rows:[[cab...],[...]],widths:[...],fmt:{col:'n1'|'n2'|'n0'|'pct'|'date'|'text'}}]) */
(function(){
'use strict';
const enc=new TextEncoder();
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC[(c^u8[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
async function deflate(u8){
  if(typeof CompressionStream==='undefined')return null;
  try{const cs=new CompressionStream('deflate-raw');const w=cs.writable.getWriter();w.write(u8);w.close();
    const buf=await new Response(cs.readable).arrayBuffer();return new Uint8Array(buf);}catch(e){return null;}
}
async function zip(files){ /* files: [{name, data:Uint8Array}] */
  const parts=[],central=[];let off=0;
  const dt=new Date(),dosT=(dt.getHours()<<11)|(dt.getMinutes()<<5)|Math.floor(dt.getSeconds()/2),dosD=((dt.getFullYear()-1980)<<9)|((dt.getMonth()+1)<<5)|dt.getDate();
  for(const f of files){
    const nm=enc.encode(f.name),crc=crc32(f.data),comp=await deflate(f.data),method=comp?8:0,body=comp||f.data;
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,method,true);
    lh.setUint16(10,dosT,true);lh.setUint16(12,dosD,true);lh.setUint32(14,crc,true);lh.setUint32(18,body.length,true);lh.setUint32(22,f.data.length,true);
    lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
    parts.push(new Uint8Array(lh.buffer),nm,body);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,method,true);
    ch.setUint16(12,dosT,true);ch.setUint16(14,dosD,true);ch.setUint32(16,crc,true);ch.setUint32(20,body.length,true);ch.setUint32(24,f.data.length,true);
    ch.setUint16(28,nm.length,true);ch.setUint16(30,0,true);ch.setUint16(32,0,true);ch.setUint16(34,0,true);ch.setUint16(36,0,true);ch.setUint32(38,0,true);ch.setUint32(42,off,true);
    central.push(new Uint8Array(ch.buffer),nm);
    off+=30+nm.length+body.length;
  }
  const cdSize=central.reduce((a,b)=>a+b.length,0);
  const end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cdSize,true);end.setUint32(16,off,true);
  return new Blob([...parts,...central,new Uint8Array(end.buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
const xe=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const colL=n=>{let s='';n++;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;};
const STY={text:0,head:1,n0:2,n1:3,n2:4,pct:5,date:6,n3:7};
const isoSerial=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return null;return (Date.UTC(+m[1],+m[2]-1,+m[3])-Date.UTC(1899,11,30))/864e5;};
function sheetXML(sh){
  const rows=sh.rows||[],fmt=sh.fmt||{},nC=Math.max(1,...rows.map(r=>r.length));
  let x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">';
  x+='<sheetViews><sheetView workbookViewId="0"'+(sh.freeze===false?'/>':'><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView>')+'</sheetViews>';
  x+='<sheetFormatPr defaultRowHeight="15"/>';
  const w=sh.widths||[];x+='<cols>'+Array.from({length:nC},(_,i)=>`<col min="${i+1}" max="${i+1}" width="${w[i]||14}" customWidth="1"/>`).join('')+'</cols><sheetData>';
  rows.forEach((r,ri)=>{
    x+=`<row r="${ri+1}">`;
    r.forEach((v,ci)=>{
      if(v==null||v==='')return;const ref=colL(ci)+(ri+1);
      if(ri===0&&sh.head!==false){x+=`<c r="${ref}" t="inlineStr" s="${STY.head}"><is><t>${xe(v)}</t></is></c>`;return;}
      const f=fmt[ci];
      if(f==='date'&&typeof v==='string'){const sn=isoSerial(v);if(sn!=null){x+=`<c r="${ref}" s="${STY.date}"><v>${sn}</v></c>`;return;}}
      if(typeof v==='number'&&isFinite(v)){x+=`<c r="${ref}" s="${STY[f]!=null?STY[f]:STY.n2}"><v>${f==='pct'?v/100:v}</v></c>`;return;}
      x+=`<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xe(v)}</t></is></c>`;
    });
    x+='</row>';
  });
  x+='</sheetData>';
  if(rows.length>1&&sh.filter!==false)x+=`<autoFilter ref="A1:${colL(nC-1)}${rows.length}"/>`;
  return x+'<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>';
}
const STYLES='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
 '<numFmts count="6"><numFmt numFmtId="164" formatCode="#,##0"/><numFmt numFmtId="165" formatCode="#,##0.0"/><numFmt numFmtId="166" formatCode="#,##0.00"/><numFmt numFmtId="167" formatCode="0.00%"/><numFmt numFmtId="168" formatCode="dd/mm/yyyy"/><numFmt numFmtId="169" formatCode="#,##0.000"/></numFmts>'+
 '<fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts>'+
 '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1A3A5C"/><bgColor indexed="64"/></patternFill></fill></fills>'+
 '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'+
 '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
 '<cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'+
 '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>'+
 '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'+
 '<xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'+
 '<xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'+
 '<xf numFmtId="167" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'+
 '<xf numFmtId="168" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'+
 '<xf numFmtId="169" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>'+
 '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
function safeName(s,used){let n=String(s).replace(/[\[\]\:\*\?\/\\]/g,' ').slice(0,31).trim()||'Planilha';let k=n,i=2;while(used.has(k)){k=(n.slice(0,28)+' '+i++);}used.add(k);return k;}
async function build(sheets){
  const used=new Set(),names=sheets.map(s=>safeName(s.name,used));
  const files=[];
  const add=(name,str)=>files.push({name,data:enc.encode(str)});
  add('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
    names.map((n,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>');
  add('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>');
  add('docProps/core.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>BRZ SAFRA</dc:title><dc:creator>Agrinvest Commodities</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">'+new Date().toISOString().slice(0,19)+'Z</dcterms:created></cp:coreProperties>');
  add('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+
    names.map((n,i)=>`<sheet name="${xe(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')+'</sheets>'+
    (()=>{const dn=sheets.map((s,i)=>s.rows&&s.rows.length>1&&s.filter!==false?`<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xe(names[i]).replace(/'/g,"''")}'!$A$1:$${colL(Math.max(1,...s.rows.map(r=>r.length))-1)}$${s.rows.length}</definedName>`:'').join('');return dn?'<definedNames>'+dn+'</definedNames>':'';})()+'</workbook>');
  add('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    names.map((n,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')+
    `<Relationship Id="rId${names.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  add('xl/styles.xml',STYLES);
  sheets.forEach((s,i)=>add(`xl/worksheets/sheet${i+1}.xml`,sheetXML(s)));
  return zip(files);
}
async function download(filename,sheets){
  const blob=await build(sheets);const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);return blob.size;
}
window.BRZXLSX={build,download};
})();
