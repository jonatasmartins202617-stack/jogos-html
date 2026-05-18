/* Magias, elementos, árvore de habilidades, grimório, combos e partículas. */
(function(){
  const ELEMENTS={fogo:{color:'#ff6b35',weak:['agua','gelo'],strong:['natureza','trevas'],icon:'🔥'},agua:{color:'#48b6ff',weak:['relampago'],strong:['fogo','terra'],icon:'💧'},gelo:{color:'#aeefff',weak:['fogo'],strong:['agua','sangue'],icon:'❄️'},terra:{color:'#8b6f3e',weak:['ar'],strong:['relampago'],icon:'⛰️'},ar:{color:'#d7fff6',weak:['gelo'],strong:['terra'],icon:'🌪️'},luz:{color:'#fff2a8',weak:['trevas'],strong:['morto-vivo','demonio'],icon:'☀️'},trevas:{color:'#9f5cff',weak:['luz'],strong:['celestial'],icon:'🌑'},natureza:{color:'#78ff72',weak:['fogo'],strong:['sangue'],icon:'🌿'},sangue:{color:'#c9184a',weak:['luz'],strong:['arcano'],icon:'🩸'},arcano:{color:'#8df7ff',weak:['sangue'],strong:['tempo','espaco'],icon:'✦'},tempo:{color:'#ffd166',weak:['arcano'],strong:['fogo'],icon:'⌛'},espaco:{color:'#72ddf7',weak:['trevas'],strong:['terra'],icon:'🌀'},relampago:{color:'#f7f06d',weak:['terra'],strong:['agua','ar'],icon:'⚡'}};
  const SPELLS=[
    {id:'bola_fogo',name:'Bola de Fogo',el:'fogo',cost:16,damage:30,cool:.35,range:720,speed:520,desc:'Projétil explosivo que incendeia plantas e slimes.'},
    {id:'lanca_gelo',name:'Lança de Gelo',el:'gelo',cost:14,damage:24,cool:.28,range:680,speed:640,slow:.35,desc:'Perfura e reduz velocidade.'},
    {id:'raio_arcano',name:'Raio Arcano',el:'arcano',cost:20,damage:38,cool:.48,range:820,speed:780,desc:'Energia pura que atravessa resistências comuns.'},
    {id:'cura_lunar',name:'Cura Lunar',el:'luz',cost:28,damage:-42,cool:1.2,range:0,speed:0,desc:'Converte mana em vida.'},
    {id:'portal_sombra',name:'Passo Sombrio',el:'trevas',cost:32,damage:10,cool:2.5,range:260,speed:0,desc:'Teleporta o mago e fere inimigos próximos.'},
    {id:'raizes',name:'Raízes Druídicas',el:'natureza',cost:22,damage:18,cool:1.1,range:360,speed:0,desc:'Prende criaturas em área.'},
    {id:'meteoro',name:'Meteoro de Ignivar',el:'fogo',cost:65,damage:110,cool:5.8,range:520,speed:0,legendary:true,desc:'Magia lendária, queda de magma em área.'},
    {id:'fenda_tempo',name:'Fenda do Tempo',el:'tempo',cost:54,damage:46,cool:4.4,range:420,speed:0,legendary:true,desc:'Desacelera todos os inimigos e duplica críticos.'},
    {id:'invocar_lobo',name:'Invocar Lobo Astral',el:'espaco',cost:45,damage:18,cool:8,range:0,speed:0,summon:true,desc:'Chama um familiar temporário.'},
    {id:'tempestade',name:'Tempestade Celeste',el:'relampago',cost:60,damage:78,cool:6.2,range:560,speed:0,legendary:true,desc:'Raios encadeados contra alvos molhados.'}
  ];
  const SKILLS=[
    {id:'mana1',name:'Fonte Interior',cost:1,desc:'+25 mana máxima'}, {id:'crit1',name:'Olho do Arquimago',cost:1,desc:'+6% crítico'},
    {id:'combo1',name:'Alquimia Elemental',cost:2,desc:'Combina elementos consecutivos'}, {id:'summon1',name:'Pacto Familiar',cost:2,desc:'Invocações duram mais'},
    {id:'craft1',name:'Runas Artesãs',cost:1,desc:'Crafting consome menos cristais'}, {id:'rep1',name:'Voz Diplomática',cost:1,desc:'Mais reputação por quests'},
    {id:'legend',name:'Círculo Lendário',cost:3,desc:'Desbloqueia meteoros e fendas ampliadas'}
  ];
  class MagicSystem{
    constructor(engine){this.engine=engine;this.projectiles=[];this.particles=[];this.cooldowns={};this.selected=0;this.unlocked=['bola_fogo','lanca_gelo','raio_arcano','cura_lunar','portal_sombra'];this.combo=[];this.skillPoints=0;this.skills={};}
    get hotbar(){return this.unlocked.slice(0,5).map(id=>SPELLS.find(s=>s.id===id))}
    update(dt){for(const id in this.cooldowns)this.cooldowns[id]=Math.max(0,this.cooldowns[id]-dt);this.projectiles=this.projectiles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;this.emit(p.x,p.y,p.color,2);return p.life>0});this.particles=this.particles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.vx*=.96;p.vy*=.96;return p.life>0});}
    cast(tx,ty){const spell=this.hotbar[this.selected];if(!spell)return false;const p=this.engine.player;if(this.cooldowns[spell.id]>0||p.mana<spell.cost)return false;p.mana-=spell.cost;this.cooldowns[spell.id]=spell.cool;this.combo.push(spell.el);this.combo=this.combo.slice(-3);if(spell.damage<0){p.hp=Math.min(p.maxHp,p.hp-spell.damage);this.burst(p.x,p.y,ELEMENTS[spell.el].color,50);this.engine.toast(`${spell.name} restaurou vida.`);return true}if(spell.id==='portal_sombra'){const a=Math.atan2(ty-p.y,tx-p.x);p.x+=Math.cos(a)*spell.range;p.y+=Math.sin(a)*spell.range;this.burst(p.x,p.y,ELEMENTS.trevas.color,90);this.engine.combat.areaDamage(p.x,p.y,120,spell.damage,spell.el);return true}if(spell.speed===0){this.burst(tx,ty,ELEMENTS[spell.el].color,spell.legendary?160:80);this.engine.combat.areaDamage(tx,ty,spell.legendary?170:120,this.comboDamage(spell),spell.el,spell);return true}const a=Math.atan2(ty-p.y,tx-p.x);this.projectiles.push({x:p.x,y:p.y,vx:Math.cos(a)*spell.speed,vy:Math.sin(a)*spell.speed,life:spell.range/spell.speed,damage:this.comboDamage(spell),el:spell.el,color:ELEMENTS[spell.el].color,spell});this.engine.audio.play('cast',spell.el);return true}
    comboDamage(spell){let dmg=spell.damage;if(this.skills.combo1&&this.combo.length>=2){const pair=this.combo.slice(-2).join('+');if(['fogo+ar','agua+relampago','gelo+terra','trevas+sangue','luz+arcano'].includes(pair))dmg*=1.65}return dmg}
    emit(x,y,color,n=1){for(let i=0;i<n;i++)this.particles.push({x,y,vx:(Math.random()-.5)*80,vy:(Math.random()-.5)*80,life:.35+Math.random()*.4,color,size:2+Math.random()*4})}
    burst(x,y,color,n=70){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*260;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.9,color,size:2+Math.random()*6})}}
    draw(ctx,camera,w,h){for(const p of this.projectiles){const x=p.x-camera.x+w/2,y=p.y-camera.y+h/2;ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=18;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}for(const p of this.particles){const x=p.x-camera.x+w/2,y=p.y-camera.y+h/2;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(x,y,p.size,p.size);ctx.globalAlpha=1}}
    unlock(id){if(!this.unlocked.includes(id)){this.unlocked.push(id);return true}return false}
    learnSkill(id){const s=SKILLS.find(x=>x.id===id);if(s&&this.skillPoints>=s.cost&&!this.skills[id]){this.skillPoints-=s.cost;this.skills[id]=true;this.engine.toast(`Habilidade aprendida: ${s.name}`);if(id==='mana1')this.engine.player.maxMana+=25;return true}return false}
    grimoireHtml(){return `<div class="grid">${SPELLS.map(s=>`<article class="card"><h3>${ELEMENTS[s.el].icon} ${s.name}</h3><p>${s.desc}</p><span class="tag">${s.el}</span><span class="tag">Mana ${s.cost}</span>${s.legendary?'<span class="tag rare">lendária</span>':''}<button data-unlock="${s.id}">${this.unlocked.includes(s.id)?'Conhecida':'Estudar runa'}</button></article>`).join('')}</div>`}
    skillsHtml(){return `<div class="grid">${SKILLS.map(s=>`<article class="card"><h3>${this.skills[s.id]?'✦':'◇'} ${s.name}</h3><p>${s.desc}</p><span class="tag">${s.cost} ponto(s)</span><button data-skill="${s.id}">${this.skills[s.id]?'Aprendida':'Aprender'}</button></article>`).join('')}</div>`}
  }
  window.GameMagic={MagicSystem,ELEMENTS,SPELLS,SKILLS};
})();
