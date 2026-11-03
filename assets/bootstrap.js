/* Bootstrap: contrato fixo de dados. NUNCA embutir os números no HTML. */
(async function init(){
  const cover=document.querySelector('#dataLoadCover');
  const message=document.querySelector('#dataLoadMessage');
  const retry=document.querySelector('#loadRetry');
  retry.addEventListener('click',()=>location.reload());
  const state=txt=>{message.textContent=txt;};
  const path='./dados/soja/plantio.json';
  try {
    const resp=await fetch(path+'?v='+Date.now(),{cache:'no-store'});
    if(!resp.ok)throw new Error('HTTP '+resp.status);
    const data=await resp.json();
    if(data.schema!=='brz.safra.plantio.v1'||data.meta?.culture!=='Soja'||data.meta?.operation!=='Semeadura'||!data.series||typeof data.series!=='object')throw new Error('Formato inválido — exige schema brz.safra.plantio.v1');
    let rows=0, latest='';
    for(const [crop,geos] of Object.entries(data.series)){
      if(!/^\d{4}\/\d{2}$/.test(crop))throw new Error('Safra inválida: '+crop);
      for(const [uf,obs] of Object.entries(geos)){
        if(!Array.isArray(obs))throw new Error('Série inválida: '+uf);
        let prev='';
        for(const [date,val] of obs){
          if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<=prev||typeof val!=='number'||val<0||val>100)throw new Error('Registro inválido '+crop+'/'+uf+'/'+date);
          prev=date;rows++;if(date>latest)latest=date;
        }
      }
    }
    if(rows===0||!latest)throw new Error('Base sem observações');
    if(data.meta.date!==latest)throw new Error('Data máxima da base diverge dos metadados');
    window.DATA=data;
    window.BRZ_DATA_STATUS={file:path,latest,rows,version:data.meta.dataVersion};
    const human=latest.slice(8,10)+'/'+latest.slice(5,7)+'/'+latest.slice(0,4);
    const upper=new Date(latest+'T12:00:00Z').toLocaleDateString('pt-BR',{month:'short',timeZone:'UTC'}).toUpperCase().replace('.','');
    const tag=latest.slice(8,10)+' '+upper+' '+latest.slice(0,4);
    for(const id of ['reportDate','dashboardDate']){const el=document.querySelector('#'+id);if(el)el.textContent=human;}
    document.querySelector('#introDate').textContent=tag;
    document.querySelector('#siteUpdated').textContent='Conab · '+human+' · base v'+(data.meta.dataVersion||1);
    // Update all visible season labels for future campaigns without changing this HTML.
    const seasons=Object.keys(data.series).sort(),current=seasons.at(-1),previous=seasons.at(-2);
    document.querySelector('#reportCard .sub').textContent='Safras '+current+' e '+previous+' · plantio acumulado (%)';
    const labels=document.querySelectorAll('#reportCard .mini-legend .legend');
    if(labels.length>=2){labels[0].lastChild.textContent=current;labels[1].lastChild.textContent=previous;}
    document.querySelector('#reloadData').addEventListener('click',()=>location.reload());
    state('Preparando os gráficos…');
    const script=document.createElement('script');script.src='./assets/app.js';
    script.onload=()=>{cover.hidden=true;document.dispatchEvent(new CustomEvent('brz:data-ready',{detail:window.BRZ_DATA_STATUS}));};
    script.onerror=()=>{state('Não foi possível carregar as ferramentas de gráfico.');retry.hidden=false;};
    document.body.append(script);
  }catch(err){
    state('Falha ao ler dados/soja/plantio.json: '+err.message+'. Para abrir localmente, use um servidor HTTP; no GitHub Pages funciona diretamente.');
    retry.hidden=false;
    console.error('[BRZ SAFRA]',err);
  }
})();