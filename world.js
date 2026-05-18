/* Mundo procedural, biomas, lore, reinos e desenho pixel art sem assets externos. */
(function(){
  const TAU=Math.PI*2;
  const BIOMES={
    bosque:{name:'Floresta Mágica de Lúmen',color:'#295c3b',floor:'#2d6d43',detail:'#7df58a',danger:.25,weather:['chuva','folhas','neblina'],lore:'Árvores cantam em élfico antigo e cristais crescem nas raízes.'},
    sombra:{name:'Floresta Sombria de Noctra',color:'#172238',floor:'#1b2a3d',detail:'#9f7aea',danger:.65,weather:['neblina','tempestade_magica'],lore:'Corvos de três olhos guardam pactos necromantes.'},
    deserto:{name:'Deserto de Vidro Solar',color:'#a66e2e',floor:'#c28a39',detail:'#f8d783',danger:.45,weather:['vento','tempestade_magica'],lore:'Dunas escondem bibliotecas enterradas e serpentes-cristal.'},
    neve:{name:'Tundra das Runas Frias',color:'#b9d8e7',floor:'#d9f4ff',detail:'#6ab7ff',danger:.42,weather:['neve','vento'],lore:'A neve repete profecias quando a lua azul nasce.'},
    montanha:{name:'Montanhas do Dragão Adormecido',color:'#555064',floor:'#6b657a',detail:'#ff9a5b',danger:.55,weather:['vento','raios'],lore:'Picos abrigam grifos, monges e portões para ilhas flutuantes.'},
    vulcao:{name:'Caldeira de Ignivar',color:'#55211f',floor:'#74312a',detail:'#ff5a2f',danger:.82,weather:['cinzas','raios'],lore:'Rios de magma sussurram nomes de magias de fogo proibidas.'},
    pantano:{name:'Pântano dos Sapos-Oráculo',color:'#304326',floor:'#42572d',detail:'#9cff7c',danger:.5,weather:['chuva','neblina'],lore:'Poças refletem futuros alternativos e abrigam hidras jovens.'},
    campo:{name:'Campos de Aurória',color:'#4c7c34',floor:'#5e963f',detail:'#f7ec70',danger:.18,weather:['folhas','chuva'],lore:'Campos seguros onde caravanas, bardos e aprendizes se encontram.'},
    ruina:{name:'Ruínas da Primeira Torre',color:'#484251',floor:'#5d5668',detail:'#8df7ff',danger:.7,weather:['neblina','tempestade_magica'],lore:'Pedras levitam em torno de portais quebrados.'},
    ilha:{name:'Ilhas Flutuantes de Aether',color:'#3c6e8a',floor:'#4f91b2',detail:'#f8d783',danger:.58,weather:['vento','nuvens'],lore:'Pontes de luz ligam ilhas onde celestiais treinam invocadores.'},
    oceano:{name:'Oceano das Estrelas Afundadas',color:'#123b68',floor:'#155187',detail:'#8df7ff',danger:.38,weather:['chuva','tempestade'],lore:'Sereias arcanas negociam mapas para reinos submersos.'},
    celestial:{name:'Céu Celestial de Elyon',color:'#6c78b9',floor:'#8391dd',detail:'#fff5ad',danger:.35,weather:['nuvens','raios'],lore:'Templos solares orbitam uma lua dourada.'},
    abismo:{name:'Reino Sombrio de Umbra',color:'#160f25',floor:'#211632',detail:'#ff4f9f',danger:.9,weather:['tempestade_magica','neblina'],lore:'Demônios e mortos-vivos disputam coroas feitas de memórias.'}
  };
  const REGIONS=[
    {x:0,y:0,r:720,biome:'campo',city:'Vila de Brisaclara',faction:'Conclave das Nove Luas'},
    {x:900,y:-350,r:700,biome:'bosque',city:'Eldarim das Folhas',faction:'Corte Élfica Verde'},
    {x:-900,y:-500,r:760,biome:'sombra',city:'Noctra',faction:'Coroa Sombria'},
    {x:1350,y:850,r:820,biome:'deserto',city:'Miragem de Safira',faction:'Mercadores do Sol'},
    {x:-1200,y:950,r:760,biome:'pantano',city:'Aldeia Anfíbia',faction:'Oráculos do Lodo'},
    {x:350,y:1600,r:850,biome:'montanha',city:'Fortaleza Grifolume',faction:'Guardas Rúnicos'},
    {x:1750,y:-1250,r:880,biome:'neve',city:'Mosteiro Glacial',faction:'Irmãs do Gelo'},
    {x:-1850,y:400,r:820,biome:'ruina',city:'Biblioteca Partida',faction:'Arqueomagos'},
    {x:2250,y:2300,r:900,biome:'vulcao',city:'Forja Ignivar',faction:'Ferreiros Ígneos'},
    {x:-2300,y:-1700,r:1000,biome:'abismo',city:'Cidadela Umbra',faction:'Legião do Eclipse'},
    {x:2800,y:-300,r:940,biome:'ilha',city:'Porto Aether',faction:'Cartógrafos do Vento'},
    {x:-2800,y:1900,r:980,biome:'oceano',city:'Porto das Marés',faction:'Navegantes Arcanos'},
    {x:420,y:-2450,r:920,biome:'celestial',city:'Templo de Elyon',faction:'Serafins da Aurora'}
  ];
  const LANDMARKS=['castelo gigante','torre mágica','biblioteca viva','escola de magia','mercado encantado','arena dos pactos','templo lunar','dungeon espiral','caverna cristalina','cachoeira suspensa','portal secreto','relíquia lendária'];
  function noise(x,y){return (Math.sin(x*12.9898+y*78.233)*43758.5453)%1}
  function nearestRegion(x,y){let best=REGIONS[0],bd=Infinity;for(const r of REGIONS){const d=(x-r.x)**2+(y-r.y)**2;if(d<bd){bd=d;best=r}}return best}
  class World{
    constructor(){this.tile=48;this.regions=REGIONS;this.biomes=BIOMES;this.secrets=new Set();this.time=7.2;this.day=1;this.moon=0;this.portals=[];this.landmarks=[];this.generateLandmarks();}
    generateLandmarks(){for(const r of REGIONS){for(let i=0;i<4;i++){const a=(i/4)*TAU+noise(r.x+i,r.y)*.6;const d=r.r*(.25+.5*Math.abs(noise(r.y,i)));this.landmarks.push({x:r.x+Math.cos(a)*d,y:r.y+Math.sin(a)*d,type:LANDMARKS[(i+Math.abs(Math.floor(r.x)))%LANDMARKS.length],region:r});}}}
    update(dt){this.time+=dt*0.035;if(this.time>=24){this.time-=24;this.day++;this.moon=(this.moon+1)%9}}
    biomeAt(x,y){return BIOMES[nearestRegion(x,y).biome]}
    regionAt(x,y){return nearestRegion(x,y)}
    isNight(){return this.time<5.5||this.time>19.5}
    light(){const t=this.time;return Math.max(.18,Math.sin((t-5)/14*Math.PI))}
    spawnPoint(){return {x:30,y:40}}
    draw(ctx,camera,w,h){const ts=this.tile;const startX=Math.floor((camera.x-w/2)/ts)-1,endX=Math.floor((camera.x+w/2)/ts)+1;const startY=Math.floor((camera.y-h/2)/ts)-1,endY=Math.floor((camera.y+h/2)/ts)+1;for(let ty=startY;ty<=endY;ty++){for(let tx=startX;tx<=endX;tx++){const x=tx*ts,y=ty*ts,b=this.biomeAt(x,y),sx=Math.floor(x-camera.x+w/2),sy=Math.floor(y-camera.y+h/2);ctx.fillStyle=b.floor;ctx.fillRect(sx,sy,ts+1,ts+1);const n=Math.abs(noise(tx,ty));ctx.fillStyle=n>.68?b.detail:n>.43?b.color:'rgba(0,0,0,.08)';if(n>.78)this.drawProp(ctx,sx,sy,ts,b,tx,ty);else{ctx.globalAlpha=.18;ctx.fillRect(sx+n*18,sy+n*22,6+n*12,3+n*8);ctx.globalAlpha=1}}}
      for(const l of this.landmarks){if(Math.abs(l.x-camera.x)<w/2+120&&Math.abs(l.y-camera.y)<h/2+120)this.drawLandmark(ctx,l,camera,w,h)}
      const darkness=1-this.light();ctx.fillStyle=`rgba(8,5,22,${darkness*.62})`;ctx.fillRect(0,0,w,h);if(this.isNight()){ctx.fillStyle='rgba(141,247,255,.08)';for(let i=0;i<30;i++){const x=(i*97+this.day*13)%w,y=(i*53)%Math.max(1,h*.45);ctx.fillRect(x,y,2,2)}}}
    drawProp(ctx,x,y,ts,b,tx,ty){const n=Math.abs(noise(tx+3,ty-5));if(['oceano'].includes(Object.keys(BIOMES).find(k=>BIOMES[k]===b))){ctx.fillStyle='rgba(141,247,255,.35)';ctx.fillRect(x,y+20+n*8,ts,3);return}ctx.fillStyle=b.color;ctx.fillRect(x+18,y+18,12,22);ctx.fillStyle=b.detail;ctx.beginPath();ctx.arc(x+24,y+15,13+n*7,0,TAU);ctx.fill();ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(x+14,y+39,24,5)}
    drawLandmark(ctx,l,camera,w,h){const x=l.x-camera.x+w/2,y=l.y-camera.y+h/2;ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(-30,28,60,10);ctx.fillStyle=l.region.biome==='vulcao'?'#ff5a2f':l.region.biome==='celestial'?'#fff5ad':'#8df7ff';ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,-14,20+8*Math.sin(performance.now()/400),0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle='#1a1235';if(l.type.includes('castelo')){ctx.fillRect(-28,-18,56,50);ctx.fillRect(-20,-42,14,24);ctx.fillRect(6,-42,14,24)}else if(l.type.includes('portal')){ctx.strokeStyle='#f8d783';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,0,20,34,0,0,TAU);ctx.stroke()}else{ctx.fillRect(-18,-35,36,65);ctx.beginPath();ctx.moveTo(-26,-35);ctx.lineTo(0,-62);ctx.lineTo(26,-35);ctx.fill()}ctx.restore()}
    drawMinimap(ctx,player){ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.fillStyle='#090717';ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);for(const r of REGIONS){const x=ctx.canvas.width/2+(r.x-player.x)/38,y=ctx.canvas.height/2+(r.y-player.y)/38;ctx.fillStyle=BIOMES[r.biome].floor;ctx.beginPath();ctx.arc(x,y,Math.max(5,r.r/80),0,TAU);ctx.fill()}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ctx.canvas.width/2,ctx.canvas.height/2,4,0,TAU);ctx.fill();}
  }
  window.GameWorld={World,BIOMES,REGIONS,LANDMARKS};
})();
