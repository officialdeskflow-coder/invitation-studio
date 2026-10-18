var a=$('bgm'),b=$('snd');
function sync(){var on=!a.paused;b.setAttribute('aria-pressed',on?'true':'false');b.classList.toggle('on',on);b.setAttribute('aria-label',on?CONFIG.music.labelOff:CONFIG.music.labelOn)}
K.music=function(){a.volume=.7;b.hidden=false;var p=a.play();if(p&&p.then)p.then(sync,sync);else sync()};
b.addEventListener('click',function(){if(a.paused){var p=a.play();if(p&&p.then)p.then(sync,sync);else sync()}else{a.pause();sync()}});
d.addEventListener('visibilitychange',function(){if(d.hidden&&!a.paused){a.pause();a.dataset.auto='1';sync()}else if(!d.hidden&&a.dataset.auto){delete a.dataset.auto;var p=a.play();if(p&&p.then)p.then(sync,sync)}});
