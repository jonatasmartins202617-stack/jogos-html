/* Sistema de narrativa, missões principais/secundárias/aleatórias, reputação, facções e conquistas. */
(function(){
  const FACTIONS=['Conclave das Nove Luas','Corte Élfica Verde','Coroa Sombria','Mercadores do Sol','Oráculos do Lodo','Guardas Rúnicos','Irmãs do Gelo','Arqueomagos','Serafins da Aurora'];
  const QUESTS=[
    {id:'tutorial',title:'Primeiros Sussurros do Grimório',kind:'principal',goal:'Fale com Mestre Orium e derrote 3 criaturas.',kills:3,reward:60,desc:'Aprenda a se mover, lançar magias e abrir menus.'},
    {id:'nove_luas',title:'As Nove Luas Partidas',kind:'principal',goal:'Recupere 4 relíquias lendárias em reinos distantes.',relics:4,reward:350,desc:'A lua final desapareceu e o mundo perde magia a cada noite.'},
    {id:'bosque',title:'Raízes que Sonham',kind:'secundária',goal:'Colete 5 essências de natureza para os elfos.',item:'essencia_natureza',need:5,reward:90,desc:'As árvores de Eldarim estão esquecendo seus nomes.'},
    {id:'arena',title:'Arena dos Pactos',kind:'evento',goal:'Derrote um boss secreto.',boss:1,reward:180,desc:'Um arauto abre a arena em noites de tempestade mágica.'},
    {id:'biblioteca',title:'Livros que Mordem',kind:'secundária',goal:'Encontre uma biblioteca viva nas ruínas.',discover:'biblioteca viva',reward:110,desc:'Páginas famintas guardam magias de espaço.'}
  ];
  class QuestSystem{
    constructor(engine){this.engine=engine;this.active=JSON.parse(JSON.stringify(QUESTS));this.completed=[];this.reputation=Object.fromEntries(FACTIONS.map(f=>[f,0]));this.titles=['Aprendiz das Estrelas'];this.achievements=[];this.killCount=0;this.flags={};}
    notifyKill(e){this.killCount++;for(const q of this.active){if(q.kills)q.progress=(q.progress||0)+1;if(q.boss&&e.boss)q.progress=(q.progress||0)+1}this.check()}
    discover(type){for(const q of this.active){if(q.discover&&type.includes(q.discover))q.progress=1}this.check()}
    check(){for(const q of [...this.active]){let done=false;if(q.kills&&q.progress>=q.kills)done=true;if(q.boss&&q.progress>=q.boss)done=true;if(q.item&&this.engine.inventory.count(q.item)>=q.need)done=true;if(q.discover&&q.progress)done=true;if(q.relics&&this.engine.inventory.items.filter(i=>i.type==='reliquia').length>=q.relics)done=true;if(done)this.complete(q)}}
    complete(q){this.active=this.active.filter(x=>x.id!==q.id);this.completed.push(q);this.engine.player.xp+=q.reward;const faction=this.engine.world.regionAt(this.engine.player.x,this.engine.player.y).faction;this.reputation[faction]=(this.reputation[faction]||0)+10+(this.engine.magic.skills.rep1?5:0);this.engine.toast(`Missão concluída: ${q.title}`);if(this.completed.length===1)this.achieve('Primeiro Capítulo');if(this.completed.length>=4)this.titles.push('Arquimago Errante')}
    achieve(name){if(!this.achievements.includes(name)){this.achievements.push(name);this.engine.toast(`Conquista: ${name}`)}}
    html(){return `<div class="grid"><article class="card"><h3>Títulos</h3>${this.titles.map(t=>`<span class="tag rare">${t}</span>`).join('')}<h3>Conquistas</h3>${this.achievements.map(a=>`<span class="tag">${a}</span>`).join('')||'Nenhuma ainda.'}</article>${this.active.map(q=>`<article class="card"><h3>${q.title}</h3><p>${q.desc}</p><p><b>${q.goal}</b></p><span class="tag">${q.kind}</span><span class="tag">Progresso ${q.progress||0}</span></article>`).join('')}<article class="card"><h3>Facções</h3>${Object.entries(this.reputation).map(([f,v])=>`<p>${f}: <b>${v}</b></p>`).join('')}</article></div>`}
  }
  window.GameQuests={QuestSystem,QUESTS,FACTIONS};
})();
