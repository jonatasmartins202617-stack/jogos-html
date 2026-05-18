/* Áudio procedural com Web Audio: música por região, chuva, passos, explosões e magia. */
(function(){
  class AudioSystem{
    constructor(){this.ctx=null;this.enabled=true;this.master=null;this.last={};}
    init(){if(this.ctx)return;this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.16;this.master.connect(this.ctx.destination)}
    play(type,el='arcano'){if(!this.enabled)return;this.init();const now=this.ctx.currentTime;if(this.last[type]&&now-this.last[type]<.05)return;this.last[type]=now;const osc=this.ctx.createOscillator(),gain=this.ctx.createGain();const freq={cast:440,hit:120,drop:660,step:90,ui:520}[type]||330;osc.type=type==='cast'?'triangle':'sine';osc.frequency.setValueAtTime(freq,now);if(type==='cast')osc.frequency.exponentialRampToValueAtTime(freq*1.7,now+.16);gain.gain.setValueAtTime(.001,now);gain.gain.exponentialRampToValueAtTime(type==='hit'?.18:.09,now+.02);gain.gain.exponentialRampToValueAtTime(.001,now+(type==='cast'?.28:.16));osc.connect(gain);gain.connect(this.master);osc.start(now);osc.stop(now+.35)}
    ambience(world){if(!this.enabled||!this.ctx)return;const hour=world.time;if(Math.floor(hour)%6===0&&Math.random()<.01)this.play('ui')}
  }
  window.GameAudio={AudioSystem};
})();
