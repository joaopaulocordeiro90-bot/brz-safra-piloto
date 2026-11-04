
/* ═══════════════ SELETOR PT-BR / EN — camada isolada de interface ═══════════════ */
(function(){
  'use strict';
  const PT='pt-BR',EN='en';
  const EXACT={
    "Cenários & Estatísticas":"Scenarios & Statistics",
    "Número Agrinvest × Conab × USDA · fluxo mensal · simulador · Equipe Agrinvest":"Agrinvest number × Conab × USDA · monthly flow · simulator · Agrinvest Team",
    "BRZ · Safras Brasil · s33":"BRZ · Brazil Crops · s33",
    "Progresso de Safra · Conab":"Crop Progress · Conab",
    "Inicial":"Home",
    "Soja":"Soybeans",
    "Milho":"Corn",
    "Sorgo":"Sorghum",
    "Trigo":"Wheat",
    "Algodão":"Cotton",
    "Arroz":"Rice",
    "Feijão":"Beans",
    "Feijão 1ª":"1st-crop Beans",
    "Safras":"Crops",
    "Base":"Database",
    "Base de Dados":"Database",
    "Opções":"Options",
    "Indicadores":"Indicators",
    "Indicadores · Safra 2026/27":"Indicators · Crop year 2026/27",
    "Atraso por UF · oferta física · tendência · divergências · Equipe Agrinvest":"Delay by state · physical supply · trend · divergences · Agrinvest Team",
    "IMEA · MT · Safra 2026/27":"IMEA · MT · Crop year 2026/27",
    "Plantio semanal · projeções · comercialização · Equipe Agrinvest":"Weekly planting · projections · marketing · Agrinvest Team",
    "Oferta & Demanda":"Supply & Demand",
    "Balanço Conab · cenário Agrinvest · leitura por safra · Equipe Agrinvest":"Conab balance · Agrinvest scenario · crop-year reading · Agrinvest Team",
    "Plantio · condição · fases por núcleo regional · Equipe Agrinvest":"Planting · condition · stages by regional office · Agrinvest Team",
    "Conab · carregando dados…":"Conab · loading data…",
    "⚙ Edição":"⚙ Edit",
    "Ativar/desativar modo edição":"Enable/disable edit mode",
    "Idioma":"Language",
    "Português (Brasil)":"Portuguese (Brazil)",
    "Fonte":"Font",
    "Tamanho (px)":"Size (px)",
    "Cor do texto":"Text color",
    "Cor da série":"Series color",
    "todos do card":"entire card",
    "1 clique seleciona · 2 cliques edita · arraste move · quadradinho da legenda muda a cor da série":"1 click selects · 2 clicks edit · drag moves · legend swatch changes the series color",
    "Plantio · colheita · volume colhido · safras · Equipe Agrinvest":"Planting · harvest · harvested volume · crop years · Agrinvest Team",
    "1ª · 2ª · 3ª safra e total · Equipe Agrinvest":"1st · 2nd · 3rd crop and total · Agrinvest Team",
    "Plantio · colheita · safras · Equipe Agrinvest":"Planting · harvest · crop years · Agrinvest Team",
    "Plantio · colheita · pluma · Equipe Agrinvest":"Planting · harvest · lint · Agrinvest Team",
    "Produção · área · produtividade · Equipe Agrinvest":"Production · area · yield · Agrinvest Team",
    "Plantio · colheita · Equipe Agrinvest":"Planting · harvest · Agrinvest Team",
    "Visão geral · séries Conab desde 1976/77 · Equipe Agrinvest":"Overview · Conab series since 1976/77 · Agrinvest Team",
    "Progresso semanal · estimativas · export CSV · Equipe Agrinvest":"Weekly progress · estimates · CSV export · Agrinvest Team",
    "Soja · Progresso de Safra":"Soybeans · Crop Progress",
    "Milho · Progresso de Safra":"Corn · Crop Progress",
    "Sorgo · Safras":"Sorghum · Crop History",
    "Trigo · Progresso de Safra":"Wheat · Crop Progress",
    "Algodão · Progresso de Safra":"Cotton · Crop Progress",
    "Arroz · Progresso de Safra":"Rice · Crop Progress",
    "Feijão 1ª · Progresso de Safra":"1st-crop Beans · Crop Progress",
    "Safras · Visão Geral Conab":"Crops · Conab Overview",
    "← menu":"← menu",
    "1ª safra":"1st crop",
    "2ª safra":"2nd crop",
    "3ª safra":"3rd crop",
    "Total":"Total",
    "Progresso semanal":"Weekly progress",
    "Estimativas de produção":"Production estimates",
    "Notas & metodologia":"Notes & methodology",
    "+ semana":"+ week",
    "Aplicar edições":"Apply edits",
    "CSV":"CSV",
    "Semana até (AAAA-MM-DD)":"Week ending (YYYY-MM-DD)",
    "% concluído":"% complete",
    "Edite as células, use “+ semana” para a leitura nova da Conab e clique em “Aplicar edições” para recalcular todos os gráficos. A Base aceita datas diárias; nas comparações, o sistema mantém a leitura mais recente de cada semana e considera o sábado como fechamento. O eixo continua exibido em meses.":"Edit the cells, use “+ week” for the latest Conab reading, then click “Apply edits” to recalculate all charts. The database accepts daily dates; in comparisons, the system keeps the latest reading in each week and uses Saturday as the week-end cutoff. The axis remains displayed by month.",
    "Aplicar estimativas":"Apply estimates",
    "Produção da safra corrente (mil t) por cultura e UF; numerador da interpolação de volume. Fonte atual: Conab out/26 (1º levantamento).":"Current crop production (kt) by crop and state — numerator in the volume interpolation. Current source: Conab Oct/26 (1st survey).",
    "Metodologia":"Methodology",
    "Progresso: Conab, relatórios “Plantio e Colheita” e “Acompanhamento semanal das lavouras”, 2019/20 → hoje. A Base preserva as leituras em suas datas originais. Para a comparação sazonal, os valores são consolidados por cultura × safra × operação × UF × semana, mantendo a leitura mais recente dentro de cada semana. O fechamento semanal é o sábado e o eixo permanece identificado por meses.":"Progress: Conab “Planting and Harvest” and “Weekly Crop Monitoring” reports, 2019/20 → today. The database preserves readings on their original dates. For seasonal comparisons, values are consolidated by crop × crop year × operation × state × week, retaining the latest reading within each week. The weekly cutoff is Saturday and the axis remains labeled by month.",
    "Percentual BR = agregado oficial Conab (“N estados”), ponderado pela área dos estados cobertos (92–98% da área nacional conforme a cultura).":"Brazil percentage = official Conab aggregate (“N states”), weighted by the acreage of covered states (92–98% of national acreage, depending on the crop).",
    "Volume colhido = produção estimada da safra (Série Histórica Conab, mil t) × % colhido. Nacional usa produção BR total × % BR; estadual usa produção da UF × % da UF. Revisões de estimativa alteram a curva de volume retroativamente, por desenho.":"Harvested volume = crop-year production estimate (Conab Historical Series, kt) × % harvested. National uses total Brazil production × Brazil %; state level uses state production × state %. Estimate revisions update the volume curve retroactively — by design.",
    "Milho 3ª e Sorgo: sem progresso semanal na Conab; apenas produção, área e produtividade.":"3rd-crop Corn and Sorghum: no weekly progress from Conab; production, area and yield only.",
    "Produtividade exibida em sc/ha (kg/ha ÷ 60). Algodão: produção e produtividade em pluma.":"Yield shown in 60-kg bags/ha (kg/ha ÷ 60). Cotton: lint production and yield.",
    "Snapshot do aplicativo":"App snapshot",
    "💾 SALVAR":"💾 SAVE",
    "⬇ EXPORTAR HTML":"⬇ EXPORT HTML",
    "🗑 Limpar salvamento":"🗑 Clear save",
    "SALVAR grava as edições neste navegador. EXPORTAR gera o arquivo BRZ_SAFRA autocontido com dados e edições; este arquivo é o canônico.":"SAVE stores edits in this browser. EXPORT generates the self-contained BRZ_SAFRA file with data and edits — this file is the master.",
    "Paleta dos gráficos":"Chart palette",
    "Edita as três cores da casa e redesenha todos os cards. O snapshot preserva a escolha.":"Edits the three house colors and redraws all cards. The snapshot retains the selection.",
    "Bege":"Beige",
    "restaurar padrão":"reset defaults",
    "Atualização semanal":"Weekly update",
    "Toda sexta a Conab publica o Acompanhamento; toda 2ª quinzena do mês, a Série Histórica. Fluxo: Base → Progresso semanal → “+ semana” com a leitura nova → Aplicar edições → SALVAR → EXPORTAR. Estimativas de produção: Base → Estimativas → editar mil t → Aplicar.":"Every Friday Conab publishes Crop Monitoring; in the second half of each month, the Historical Series. Workflow: Database → Weekly progress → “+ week” with the new reading → Apply edits → SAVE → EXPORT. Production estimates: Database → Estimates → edit kt → Apply.",
    "Dados e data de consolidação são lidos diretamente da base incorporada no arquivo.":"Data and the consolidation date are read directly from the file’s embedded database.",
    "sem dados":"no data",
    "Semeadura":"Planting",
    "Plantio":"Planting",
    "Colheita":"Harvest",
    "Colhido":"Harvested",
    "colhido":"harvested",
    "a colher":"remaining",
    "ano-1":"prev. year",
    "méd-5":"5-crop avg.",
    "Produção":"Production",
    "Área · Produtividade":"Area · Yield",
    "Área":"Area",
    "Produtividade":"Yield",
    "Brasil":"Brazil",
    "Distrito Federal":"Federal District",
    "atual · alta":"current · ahead",
    "atual · queda":"current · behind",
    "média 5 safras":"5-crop avg.",
    "anteriores":"prior crops",
    "safra atual":"current crop",
    "área (Mi ha)":"area (Mha)",
    "produtividade (sc/ha)":"yield (bags/ha)",
    "Milho 1ª":"1st-crop Corn",
    "Milho 2ª":"2nd-crop Corn",
    "Milho 3ª":"3rd-crop Corn",
    "Milho Total":"Total Corn",
    "Restaurar card":"Reset card",
    "PNG do card (3×)":"Card PNG (3×)",
    "série oculta — filtrada no modo dinâmico":"hidden series — filtered in dynamic mode",
    "Conab · Plantio e Colheita + Série Histórica":"Conab · Planting & Harvest + Historical Series",
    "remover":"remove",
    "Base sincronizada ✓":"Database synced ✓",
    "Estimativas aplicadas ✓":"Estimates applied ✓",
    "Aviso: não coube no navegador; use EXPORTAR HTML.":"Warning: it did not fit in browser storage; use EXPORT HTML.",
    "Edições salvas ✓":"Edits saved ✓",
    "Nenhum salvamento nesta máquina ainda.":"No saves on this device yet.",
    "Limpar edições salvas nesta máquina?":"Clear saved edits on this device?",
    "Paleta restaurada.":"Palette restored.",
    "Tipografia global":"Global typography",
    "Título":"Title",
    "Subtítulo":"Subtitle",
    "Legendas":"Legends",
    "Eixo Y":"Y axis",
    "Eixo X":"X axis",
    "Valores":"Values",
    "Rodapé":"Footer",
    "Mostrar rodapé":"Show footer",
    "zoom por seleção":"selection zoom",
    "desfazer zoom":"undo zoom",
    "linha":"line",
    "barra":"bar",
    "restaurar":"restore",
    "dados":"data",
    "Dados da série":"Series data",
    "fechar":"close",
    "atualizar":"refresh",
    "salvar PNG":"save PNG",
    "baixar CSV":"download CSV",
    "tela cheia":"full screen",
    "Modo dinâmico: zoom, tooltip, linha↔barra, dados, tela cheia, CSV":"Dynamic mode: zoom, tooltip, line↔bar, data, full screen, CSV",
    "Sem acesso ao CDN — modo dinâmico requer internet.":"CDN unavailable — dynamic mode requires internet access.",
    "Nome da nova coluna:":"New column name:",
    "UF":"State",
    "CENTRO-OESTE":"CENTER-WEST",
    "CENTRO-SUL":"CENTER-SOUTH",
    "NORDESTE":"NORTHEAST",
    "NORTE":"NORTH",
    "NORTE/NORDESTE":"NORTH/NORTHEAST",
    "SUDESTE":"SOUTHEAST",
    "SUL":"SOUTH"
  };
  const PHRASES=[
    ["Plantado × a plantar por UF","Planted vs remaining by state"],["Plantio vs ano-1 por UF","Planting vs previous year by state"],
    ["Ritmo de plantio","Planting pace"],["a plantar","to plant"],["plantado","planted"],
    ["Milho 1ª","1st-crop Corn"],["Milho 2ª","2nd-crop Corn"],["Milho 3ª","3rd-crop Corn"],["Milho Total","Total Corn"],
    ["Feijão 1ª","1st-crop Beans"],["1ª safra","1st crop"],["2ª safra","2nd crop"],["3ª safra","3rd crop"],
    ["Milho por safra — 1ª + 2ª + 3ª","Corn by crop — 1st + 2nd + 3rd"],
    ["Colhido × a colher por UF","Harvested vs remaining by state"],
    ["Colheita vs ano-1 por UF","Harvest vs previous year by state"],
    ["Mi t acumuladas · % colhido × produção estimada de cada safra","Cumulative Mmt · % harvested × estimated production for each crop year"],
    ["% da área semeada · semana do ano-safra · 5 safras","% of planted area · crop-year week · 5 crop years"],
    ["% da área colhida · semana do ano-safra · 5 safras","% of harvested area · crop-year week · 5 crop years"],
    ["% na semana selecionada · ano-1 → atual","% in selected week · previous year → current"],
    ["p.p. por semana · safra atual vs média","p.p. per week · current crop vs average"],
    ["Mi ha e sc/ha · últimas 15 safras","Mha and bags/ha · latest 15 crop years"],
    ["Mi t · últimas 15 safras · Conab","Mmt · latest 15 crop years · Conab"],
    ["Mi t · composição da produção total","Mmt · total production mix"],
    ["Safra ","Crop year "],
    ["safra corrente","current crop"],
    ["safra atual","current crop"],
    ["ano-safra","crop year"],
    ["semana selecionada","selected week"],
    ["semana do ano-safra","crop-year week"],
    ["últimas 15 safras","latest 15 crop years"],
    ["produção estimada","estimated production"],
    ["produção total","total production"],
    ["produção da safra","crop-year production"],
    ["Produção —","Production —"],
    ["Produção ","Production "],
    ["Área × produtividade","Area × yield"],
    ["Leitura da safra","Crop reading"],
    ["Volume colhido","Harvested volume"],
    ["Ritmo de colheita","Harvest pace"],
    ["Colheita —","Harvest —"],
    ["Plantio —","Planting —"],
    ["área semeada","planted area"],
    ["área colhida","harvested area"],
    ["volume colhido","harvested volume"],
    ["média 5 safras","5-crop avg."],
    ["ano-1","prev. year"],["méd-5","5-crop avg."],
    ["5 safras","5 crop years"],
    ["Série Histórica","Historical Series"],
    ["séries Conab","Conab series"],
    ["Progresso de Safra","Crop Progress"],
    ["Progresso semanal","Weekly progress"],
    ["progresso semanal","weekly progress"],
    ["Visão Geral","Overview"],
    ["Visão geral","Overview"],
    ["Estimativas","Estimates"],
    ["estimativas","estimates"],
    ["por cultura e UF","by crop and state"],
    ["por UF","by state"],
    ["da UF","of the state"],
    ["% da UF","state %"],
    ["UF × semana","state × week"],
    ["Equipe Agrinvest","Agrinvest Team"],
    ["consolidado","consolidated"],
    ["dados até","data through"],
    ["Sem.","Wk."],
    ["até","through"],
    ["semanas","weeks"],
    ["semana","week"],
    ["semanal","weekly"],
    ["safras","crop years"],
    ["safra","crop year"],
    ["colheita","harvest"],
    ["plantio","planting"],
    ["semeadura","planting"],
    ["a colher","remaining"],
    ["Colheita","Harvest"],
    ["Plantio","Planting"],
    ["Semeadura","Planting"],
    ["colhido","harvested"],
    ["produção","production"],
    ["produtividade","yield"],
    ["área","area"],
    ["atual","current"],
    ["anteriores","prior crops"],
    ["média","average"],
    ["erro:","error:"],
    ["Falha ao ampliar:","Unable to enlarge:"],
    ["Dinâmico indisponível:","Dynamic mode unavailable:"],
    ["Exportado com edições","Exported with edits"],
    ["Último salvamento:","Last saved:"],
    ["p.p./sem","p.p./wk"],
    ["sc/ha","bags/ha"],
    ["Mi ha","Mha"],
    ["mil ha","kha"],
    ["Mi t","Mmt"],
    ["mil t","kt"],
    ["Soja","Soybeans"],
    ["Milho","Corn"],
    ["Sorgo","Sorghum"],
    ["Trigo","Wheat"],
    ["Algodão","Cotton"],
    ["Arroz","Rice"],
    ["Feijão","Beans"],
    ["Brasil","Brazil"],
    ["UF","State"]
  ];
  const MONTHS=[
    ["janeiro","January"],["fevereiro","February"],["março","March"],["abril","April"],["maio","May"],["junho","June"],
    ["julho","July"],["agosto","August"],["setembro","September"],["outubro","October"],["novembro","November"],["dezembro","December"],
    ["Jan","Jan"],["Fev","Feb"],["Mar","Mar"],["Abr","Apr"],["Mai","May"],["Jun","Jun"],
    ["Jul","Jul"],["Ago","Aug"],["Set","Sep"],["Out","Oct"],["Nov","Nov"],["Dez","Dec"],
    ["jan","Jan"],["fev","Feb"],["mar","Mar"],["abr","Apr"],["mai","May"],["jun","Jun"],
    ["jul","Jul"],["ago","Aug"],["set","Sep"],["out","Oct"],["nov","Nov"],["dez","Dec"]
  ];
  const PAIRS=[...PHRASES,...MONTHS].sort((a,b)=>b[0].length-a[0].length);
  const REVERSE_EXACT={};
  Object.entries(EXACT).forEach(([pt,en])=>{if(REVERSE_EXACT[en]===undefined)REVERSE_EXACT[en]=pt;});
  const REVERSE_PAIRS=PAIRS.map(([pt,en])=>[en,pt]).sort((a,b)=>b[0].length-a[0].length);
  const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const replaceToken=(s,a,b)=>{
    if(!a||a===b)return s;
    const edge=/^[A-Za-zÀ-ÿ0-9]/.test(a)&&/[A-Za-zÀ-ÿ0-9]$/.test(a);
    if(!edge)return s.replace(new RegExp(escapeRE(a),'g'),b);
    return s.replace(new RegExp('(^|[^A-Za-zÀ-ÿ0-9])'+escapeRE(a)+'(?=$|[^A-Za-zÀ-ÿ0-9])','gu'),(all,prefix)=>prefix+b);
  };
  function translateCore(input,to){
    if(input==null)return input;
    const raw=String(input),m=raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if(!m||!m[2])return raw;
    let s=m[2];
    if(to===EN){
      if(EXACT[s]!==undefined)s=EXACT[s];
      else{
        s=s.replace(/^Último salvamento:\s*/,'Last saved: ')
          .replace(/^(\d+)\s+semanas\s+·\s+/,'$1 weeks · ')
          .replace(/^Falha ao ampliar:\s*/,'Unable to enlarge: ')
          .replace(/^Dinâmico indisponível:\s*/,'Dynamic mode unavailable: ')
          .replace(/^erro:\s*/,'error: ');
        for(const [a,b] of PAIRS)s=replaceToken(s,a,b);
        s=s.replace(/\b(\d{2})\/(\d{2})\/(\d{2})\b/g,'$2/$1/$3')
          .replace(/\bWk\.\s+(\d{2})\/(\d{2})\b/g,'Wk. $2/$1')
          .replace(/(?<=\d)\.(?=\d{3}(?:\D|$))/g,'\uE000')
          .replace(/(\d),(\d)/g,'$1.$2')
          .replace(/\uE000/g,',');
      }
    }else{
      if(REVERSE_EXACT[s]!==undefined)s=REVERSE_EXACT[s];
      else{
        s=s.replace(/^Last saved:\s*/,'Último salvamento: ')
          .replace(/^(\d+)\s+weeks\s+·\s+/,'$1 semanas · ')
          .replace(/^Unable to enlarge:\s*/,'Falha ao ampliar: ')
          .replace(/^Dynamic mode unavailable:\s*/,'Dinâmico indisponível: ')
          .replace(/^error:\s*/,'erro: ');
        for(const [a,b] of REVERSE_PAIRS)s=replaceToken(s,a,b);
        s=s.replace(/\b(\d{2})\/(\d{2})\/(\d{2})\b/g,'$2/$1/$3')
          .replace(/\bSem\.\s+(\d{2})\/(\d{2})\b/g,'Sem. $2/$1')
          .replace(/(\d),(\d{3})(?=(?:\D|$))/g,'$1\uE000$2')
          .replace(/(\d)\.(\d)/g,'$1,$2')
          .replace(/\uE000/g,'.');
      }
    }
    return m[1]+s+m[3];
  }

  const textSource=new WeakMap(),attrSource=new WeakMap();
  const ATTRS=['title','placeholder','aria-label','alt'];
  let current=PT,paused=false,reverseUnknown=false,exportPass=false,exportWanted=null;
  const skipNode=n=>{
    const p=n.nodeType===1?n:n.parentElement;
    return !p||!!p.closest('script,style,template,noscript,[contenteditable="true"],[data-noi18n]');
  };
  function pinOptionValue(node){
    const el=node&&node.nodeType===1?node:node&&node.parentElement;
    if(!el)return;
    const opts=el.matches&&el.matches('option')?[el]:(el.querySelectorAll?[...el.querySelectorAll('option')]:[]);
    opts.forEach(o=>{if(!o.hasAttribute('value'))o.setAttribute('value',o.value);});
  }
  function setText(n,to){
    if(!n||n.nodeType!==3||skipNode(n))return;
    pinOptionValue(n);
    let src=textSource.get(n);
    if(src===undefined){
      src=(to===PT&&reverseUnknown)?translateCore(n.nodeValue,PT):n.nodeValue;
      textSource.set(n,src);
    }
    const value=to===EN?translateCore(src,EN):src;
    if(n.nodeValue!==value)n.nodeValue=value;
  }
  function setAttrs(el,to){
    if(!el||el.nodeType!==1||skipNode(el))return;
    let src=attrSource.get(el);if(!src){src={};attrSource.set(el,src);}
    ATTRS.forEach(a=>{
      if(!el.hasAttribute(a))return;
      if(src[a]===undefined)src[a]=(to===PT&&reverseUnknown)?translateCore(el.getAttribute(a),PT):el.getAttribute(a);
      const value=to===EN?translateCore(src[a],EN):src[a];
      if(el.getAttribute(a)!==value)el.setAttribute(a,value);
    });
  }
  function translateTree(root,to,options){
    if(!root)return;
    const oldReverse=reverseUnknown;
    reverseUnknown=!!(options&&options.reverseUnknown);
    paused=true;
    try{
      pinOptionValue(root);
      if(root.nodeType===3)setText(root,to);
      else if(root.nodeType===1)setAttrs(root,to);
      const base=root.nodeType===9?root.documentElement:root;
      if(base){
        const w=document.createTreeWalker(base,NodeFilter.SHOW_TEXT);
        let n;while((n=w.nextNode()))setText(n,to);
        if(base.nodeType===1)setAttrs(base,to);
        base.querySelectorAll&&base.querySelectorAll('[title],[placeholder],[aria-label],[alt]').forEach(el=>setAttrs(el,to));
      }
    }finally{paused=false;reverseUnknown=oldReverse;}
  }
  function updateControls(){
    document.querySelectorAll('#lang-switch [data-lang]').forEach(b=>{
      const on=b.dataset.lang===current;
      b.classList.toggle('active',on);
      b.setAttribute('aria-pressed',String(on));
    });
  }
  function translateHidden(to){
    document.querySelectorAll('.p-card').forEach(card=>{
      if(!card._hidden||!card._hidden.size)return;
      card._hidden=new Set([...card._hidden].map(x=>translateCore(x,to)));
    });
  }
  function refreshCharts(){
    try{
      if(typeof ECHM!=='undefined')ECHM.forEach((inst,card)=>{
        if(!inst||!inst.chart||!card||!card.dataset.card)return;
        const opt=buildOption(card,false);
        if(opt)inst.chart.setOption(opt,true);
      });
      const modal=document.getElementById('dynmodal');
      if(modal&&modal._chart&&modal._src){
        const opt=buildOption(modal._src,true);
        if(opt)modal._chart.setOption(opt,true);
      }
    }catch(e){}
  }
  function applyLanguage(lang,persist){
    const next=lang===EN?EN:PT;
    if(next!==current)translateHidden(next);
    current=next;
    translateTree(document,current);
    document.documentElement.lang=current;
    document.documentElement.dataset.lang=current;
    updateControls();
    if(persist!==false){try{localStorage.setItem('brz_safra_language',current);}catch(e){}}
    try{if(typeof optStatus==='function')optStatus();}catch(e){}
    refreshCharts();
  }
  function deepTranslate(value,seen){
    if(current!==EN||value==null)return value;
    if(typeof value==='string')return translateCore(value,EN);
    if(typeof value==='function')return function(){
      const out=value.apply(this,arguments);
      return typeof out==='string'?translateCore(out,EN):out;
    };
    if(typeof value!=='object')return value;
    seen=seen||new WeakMap();if(seen.has(value))return seen.get(value);
    const out=Array.isArray(value)?[]:Object.create(Object.getPrototypeOf(value)||Object.prototype);
    seen.set(value,out);
    Object.keys(value).forEach(k=>out[k]=deepTranslate(value[k],seen));
    if(out.legend&&out.legend.selected){
      out.legend.selected=Object.fromEntries(Object.entries(out.legend.selected).map(([k,v])=>[translateCore(k,EN),v]));
    }
    return out;
  }

  window.BRZI18N={
    current:()=>current,
    locale:()=>current===EN?'en-US':'pt-BR',
    t:s=>current===EN?translateCore(s,EN):s,
    toEnglish:s=>translateCore(s,EN),
    toPortuguese:s=>translateCore(s,PT),
    set:lang=>applyLanguage(lang,true),
    translateTree,
    translateOption:deepTranslate
  };

  if(typeof buildOption==='function'){
    const rawBuildOption=buildOption;
    buildOption=function(){return deepTranslate(rawBuildOption.apply(this,arguments));};
  }
  if(typeof corVar==='function'){
    const rawCorVar=corVar;
    corVar=function(card,lbl,fallback){
      if(current!==EN)return rawCorVar(card,lbl,fallback);
      const translated=translateCore(lbl,EN);
      const b=[...card.querySelectorAll('.lg span b')].find(x=>x.textContent===translated||translateCore(x.textContent,PT)===lbl);
      if(b){const inp=b.parentElement.querySelector('input.lgc');if(inp)return inp.value;}
      return fallback;
    };
  }
  if(typeof csvText==='function'){
    const rawCsvText=csvText;
    const CSV_HEADERS={
      semana_ate:'week_ending',safra:'crop_year',uf:'state',pct:'pct',mi_t:'mmt',
      pct_colhido:'pct_harvested',pct_plantado:'pct_planted',pp_semana:'pp_week',media5_pp:'avg5_pp',plantado_mi_ha:'planted_mha',a_plantar_mi_ha:'to_plant_mha',colhido_mi_t:'harvested_mmt',a_colher_mi_t:'remaining_mmt',
      pct_ano1:'pct_prev_year',pct_atual:'pct_current',delta_pp:'delta_pp',
      producao_mil_t:'production_kt',area_mil_ha:'area_kha',produt_kg_ha:'yield_kg_ha'
    };
    csvText=function(rows){
      if(current!==EN||!Array.isArray(rows)||!rows.length)return rawCsvText(rows);
      const copy=rows.map((r,i)=>i?r.slice():r.map(v=>CSV_HEADERS[v]||v));
      return rawCsvText(copy);
    };
  }
  if(typeof optStatus==='function'){
    const rawOptStatus=optStatus;
    optStatus=function(){
      if(current!==EN){rawOptStatus();return;}
      const el=document.getElementById('opt-status');if(!el)return;
      el.textContent=window.__SAVED__?'Last saved: '+new Date(window.__SAVED__.ts).toLocaleString('en-US'):'No saves on this device yet.';
    };
  }
  if(typeof collectState==='function'){
    const rawCollectState=collectState;
    collectState=function(){
      const wanted=exportWanted||current;
      const normalize=current===EN;
      if(normalize){
        try{if(typeof dynOffAll==='function')dynOffAll();}catch(e){}
        translateTree(document,PT,{reverseUnknown:true});
      }
      let state;
      try{
        state=rawCollectState();
        state.ui=state.ui||{};
        state.ui.lang=wanted;
        return state;
      }finally{
        if(normalize&&!exportPass)translateTree(document,EN);
      }
    };
  }
  if(typeof exportarHTML==='function'){
    const rawExportarHTML=exportarHTML;
    exportarHTML=function(){
      const wanted=current;
      exportPass=true;exportWanted=wanted;
      if(wanted===EN){
        try{if(typeof dynOffAll==='function')dynOffAll();}catch(e){}
        translateHidden(PT);
        current=PT;
        translateTree(document,PT,{reverseUnknown:true});
        document.documentElement.lang=PT;
        document.documentElement.dataset.lang=PT;
        updateControls();
      }
      try{return rawExportarHTML.apply(this,arguments);}
      finally{
        exportPass=false;exportWanted=null;
        if(wanted===EN){
          current=EN;
          translateHidden(EN);
          translateTree(document,EN);
          document.documentElement.lang=EN;
          document.documentElement.dataset.lang=EN;
          updateControls();
          refreshCharts();
        }
      }
    };
  }

  const nativeAlert=window.alert.bind(window);
  const nativePrompt=window.prompt.bind(window);
  const nativeConfirm=window.confirm.bind(window);
  window.alert=msg=>nativeAlert(current===EN?translateCore(msg,EN):msg);
  window.prompt=(msg,def)=>nativePrompt(current===EN?translateCore(msg,EN):msg,def);
  window.confirm=msg=>nativeConfirm(current===EN?translateCore(msg,EN):msg);

  const observer=new MutationObserver(records=>{
    if(paused)return;
    records.forEach(r=>{
      if(r.type==='childList')r.addedNodes.forEach(n=>translateTree(n,current));
      else if(r.type==='characterData'){
        const n=r.target;if(skipNode(n))return;
        const src=textSource.get(n);
        if(current===EN){
          const expected=src===undefined?null:translateCore(src,EN);
          if(expected!==n.nodeValue)textSource.set(n,translateCore(n.nodeValue,PT));
          setText(n,EN);
        }else{textSource.set(n,n.nodeValue);}
      }else if(r.type==='attributes'){
        const el=r.target,a=r.attributeName;if(skipNode(el)||!ATTRS.includes(a))return;
        let src=attrSource.get(el);if(!src){src={};attrSource.set(el,src);}
        if(current===EN){
          const expected=src[a]===undefined?null:translateCore(src[a],EN);
          if(expected!==el.getAttribute(a))src[a]=translateCore(el.getAttribute(a),PT);
          setAttrs(el,EN);
        }else src[a]=el.getAttribute(a);
      }
    });
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  document.getElementById('lang-switch')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-lang]');if(b)applyLanguage(b.dataset.lang,true);
  });
  let initial=(window.__SAVED__&&window.__SAVED__.ui&&window.__SAVED__.ui.lang)||null;
  if(!initial){try{initial=localStorage.getItem('brz_safra_language');}catch(e){}}
  applyLanguage(initial===EN?EN:PT,false);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>applyLanguage(current,false),{once:true});
  }
})();
