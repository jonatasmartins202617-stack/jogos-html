/* NPCs com rotina diária, comércio, diálogos, patrulha de guardas e reação ao jogador. */
(function(){
  const RACES=['Humano','Elfo','Orc','Dragônico','Espírito','Morto-vivo','Demoníaco','Celestial','Híbrido','Fera mágica'];
  const JOBS=['mestre','guarda','mercador','alquimista','bibliotecária','ferreiro rúnico','curandeira','bardo','invocadora','marinheiro'];
  class NPCSystem{
    constructor(engine){this.engine=engine;this.npcs=[];this.makeNpcs();}
    makeNpcs(){for(const r of window.GameWorld.REGIONS){for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,d=Math.random()*r.r*.32;this.npcs.push({x:r.x+Math.cos(a)*d,y:r.y+Math.sin(a)*d,home:{x:r.x,y:r.y},name:this.name(i,r),race:RACES[(i+Math.abs(Math.floor(r.x)))%RACES.length],job:JOBS[i%JOBS.length],faction:r.faction,dialog:this.dialogFor(r,i),routine:Math.random()*10,color:i%2?'#f8d783':'#8df7ff'});}}}
    name(i,r){return ['Orium','Lyra','Tharok','Seren','Mavka','Noctil','Asha','Brum','Kael','Ione'][(i+Math.abs(Math.floor(r.y)))%10]+' de '+r.city.split(' ')[0]}
    dialogFor(r,i){const base=[`Bem-vindo a ${r.city}. ${window.GameWorld.BIOMES[r.biome].lore}`,`Nossa facção, ${r.faction}, observa suas escolhas.`, 'Dica: combine fogo+ar, água+relâmpago ou luz+arcano para combos.', 'Há portais secretos perto de marcos brilhantes.', 'Use I, M, G, Q e Esc para sobreviver.'];return base[i%base.length]}
    update(dt){const time=this.engine.world.time;for(const n of this.npcs){let tx=n.home.x,ty=n.home.y;if(time>8&&time<18){tx=n.home.x+Math.sin(time+n.routine)*95;ty=n.home.y+Math.cos(time*.7+n.routine)*75}else if(n.job==='guarda'){tx=n.home.x+Math.sin(time*2+n.routine)*190;ty=n.home.y+Math.cos(time*2+n.routine)*190}const dx=tx-n.x,dy=ty-n.y,d=Math.hypot(dx,dy)||1;n.x+=dx/d*22*dt;n.y+=dy/d*22*dt}}
    nearest(max=80){const p=this.engine.player;let best=null,bd=max;for(const n of this.npcs){const d=Math.hypot(n.x-p.x,n.y-p.y);if(d<bd){bd=d;best=n}}return best}
    interact(){const n=this.nearest();if(!n)return false;this.engine.showDialogue(n);if(n.job==='mercador')this.engine.openOverlay('Loja',this.engine.inventory.shopHtml());if(n.job==='alquimista'||n.job==='ferreiro rúnico')this.engine.openOverlay('Crafting',this.engine.inventory.craftHtml());if(n.job==='mestre')this.engine.magic.skillPoints++;return true}
    draw(ctx,camera,w,h){for(const n of this.npcs){if(Math.abs(n.x-camera.x)>w/2+60||Math.abs(n.y-camera.y)>h/2+60)continue;const x=n.x-camera.x+w/2,y=n.y-camera.y+h/2;ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-10,y+14,20,4);ctx.fillStyle=n.color;ctx.fillRect(x-7,y-12,14,24);ctx.fillStyle='#f4c7a1';ctx.fillRect(x-6,y-22,12,10);ctx.fillStyle='#fff';ctx.fillText(n.job,x-20,y-28)}}
  }
  window.GameNPC={NPCSystem,RACES,JOBS};
})();
