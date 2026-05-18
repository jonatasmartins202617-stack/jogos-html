/* Saves automáticos/manuais com slots em localStorage. */
(function(){
  const KEY='arcanum_nove_luas_slot_';
  class SaveSystem{
    constructor(engine){this.engine=engine;this.autoTimer=0;this.currentSlot=1;}
    update(dt){this.autoTimer+=dt;if(this.autoTimer>45){this.save(0);this.autoTimer=0;this.engine.toast('Save automático concluído.')}}
    snapshot(){const e=this.engine,p=e.player;return {version:1,date:new Date().toISOString(),player:p,inventory:e.inventory.items,equipment:e.inventory.equipment,quests:{active:e.quests.active,completed:e.quests.completed,reputation:e.quests.reputation,titles:e.quests.titles,achievements:e.quests.achievements},magic:{unlocked:e.magic.unlocked,skills:e.magic.skills,skillPoints:e.magic.skillPoints},world:{time:e.world.time,day:e.world.day,moon:e.world.moon},bosses:e.combat.bossesDefeated};}
    save(slot=this.currentSlot){localStorage.setItem(KEY+slot,JSON.stringify(this.snapshot()));return true}
    load(slot=this.currentSlot){const raw=localStorage.getItem(KEY+slot);if(!raw)return null;return JSON.parse(raw)}
    apply(data){if(!data)return false;Object.assign(this.engine.player,data.player);this.engine.inventory.items=data.inventory||[];this.engine.inventory.equipment=data.equipment||{};Object.assign(this.engine.quests,data.quests||{});Object.assign(this.engine.magic,data.magic||{});Object.assign(this.engine.world,data.world||{});this.engine.combat.bossesDefeated=data.bosses||[];return true}
    slotsHtml(){let html='<div class="grid">';for(let i=0;i<4;i++){const d=this.load(i);html+=`<article class="card"><h3>${i===0?'Auto-save':'Slot '+i}</h3><p>${d?new Date(d.date).toLocaleString('pt-BR'):'Vazio'}</p><button data-save-slot="${i}">Salvar</button><button data-load-slot="${i}">Carregar</button></article>`}return html+'</div>'}
  }
  window.GameSave={SaveSystem};
})();
