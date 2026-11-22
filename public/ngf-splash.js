/* NGF : écran de lancement. Copier tel quel dans l'application, puis appeler ngfSplash() au démarrage. */
(function (g) {
  var CSS = ".ngf-sp{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;align-content:center;gap:18px;background:radial-gradient(ellipse at 50% 40%,#1a1426 0%,#08080B 70%);color:#F5F3EE;overflow:hidden;transition:opacity .35s}"
  + ".ngf-sp.out{opacity:0}"
  + ".ngf-sp::before{content:'';position:absolute;inset:0;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cpath d='M0 32 16 16l16 16 16-16 16 16M0 64 16 48l16 16 16-16 16 16' fill='none' stroke='%23E0B54A' stroke-width='2.6' stroke-linejoin='round'/%3E%3Cpath d='M32 4 40 12 32 20 24 12Z' fill='%23E0B54A'/%3E%3Cpath d='M32 8 36 12 32 16 28 12Z' fill='%2308080B'/%3E%3Ccircle cx='8' cy='8' r='2.6' fill='%23EF2B3A'/%3E%3Ccircle cx='56' cy='8' r='2.6' fill='%23EF2B3A'/%3E%3C/svg%3E\");opacity:.38;-webkit-mask-image:radial-gradient(ellipse at 50% 42%,transparent 18%,#000 85%);mask-image:radial-gradient(ellipse at 50% 42%,transparent 18%,#000 85%)}"
  + ".ngf-sp .k{position:absolute;left:0;right:0;top:0;height:12px;background:repeating-linear-gradient(90deg,#E8C45A 0 26px,#EF2B3A 26px 38px,#08080B 38px 42px,#2F6BFF 42px 56px,#E8C45A 56px 60px,#9333EA 60px 74px,#08080B 74px 78px)}"
  + ".ngf-sp .logo{position:relative;display:flex;font:900 clamp(5rem,30vw,10rem)/1 Nunito,'Trebuchet MS',system-ui,sans-serif;filter:drop-shadow(0 0 26px rgba(239,43,58,.35)) drop-shadow(0 0 40px rgba(124,58,237,.5))}"
  + ".ngf-sp .logo span{display:inline-block;opacity:0;transform-origin:50% 90%;background:linear-gradient(100deg,#1F5BFF 0%,#6D28D9 22%,#9333EA 48%,#EF2B3A 78%,#E0B54A 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent}"
  + ".ngf-sp .logo span:nth-child(1){background-position:0 0}.ngf-sp .logo span:nth-child(2){background-position:50% 0}.ngf-sp .logo span:nth-child(3){background-position:100% 0}"
  + ".ngf-sp .logo.go span:nth-child(1){animation:ngfN 1s cubic-bezier(.3,.7,.4,1) .2s forwards}"
  + ".ngf-sp .logo.go span:nth-child(2){animation:ngfG 1.1s cubic-bezier(.3,.7,.4,1) .6s forwards}"
  + ".ngf-sp .logo.go span:nth-child(3){animation:ngfF 1.1s cubic-bezier(.3,.7,.4,1) 1s forwards}"
  + ".ngf-sp .logo.quick span{animation:ngfPop .3s cubic-bezier(.2,.9,.3,1.4) forwards}"
  + ".ngf-sp .logo.quick span:nth-child(2){animation-delay:.12s}.ngf-sp .logo.quick span:nth-child(3){animation-delay:.24s}"
  + ".ngf-sp .logo.jelly span{opacity:1;animation:ngfJelly .7s ease-in-out}"
  + ".ngf-sp .logo.wave span{opacity:1;animation:ngfHop .6s ease-in-out}.ngf-sp .logo.wave span:nth-child(2){animation-delay:.1s}.ngf-sp .logo.wave span:nth-child(3){animation-delay:.2s}"
  + ".ngf-sp .logo.done span{opacity:1;animation:none}"
  + ".ngf-sp .nm{position:relative;display:flex;flex-wrap:wrap;justify-content:center;min-height:1.6em;font:800 clamp(.9rem,4vw,1.3rem)/1.2 Nunito,'Trebuchet MS',system-ui,sans-serif;letter-spacing:.3em;text-transform:uppercase;padding:0 16px;text-align:center}"
  + ".ngf-sp .nm i{font-style:normal;display:inline-block;background:linear-gradient(135deg,#FFF1B8,#E8C45A 30%,#B8860B 60%,#F6DE8D 82%,#C99A2E);-webkit-background-clip:text;background-clip:text;color:transparent;animation:ngfPopL .45s cubic-bezier(.2,.9,.3,1.4) both}"
  + ".ngf-sp .nm i.sp{width:.6em}"
  + "@keyframes ngfN{0%{transform:translateY(-160%) scale(.85,1.35);opacity:0}50%{transform:translateY(0) scale(1.3,.65);opacity:1}68%{transform:translateY(-26%) scale(.88,1.15)}84%{transform:translateY(0) scale(1.1,.92)}100%{transform:none;opacity:1}}"
  + "@keyframes ngfG{0%{transform:translateX(-170%) rotate(-600deg);opacity:0}60%{transform:translateX(9%) rotate(22deg);opacity:1}80%{transform:translateX(-4%) rotate(-9deg)}100%{transform:none;opacity:1}}"
  + "@keyframes ngfF{0%{transform:translateX(170%) skewX(-32deg);opacity:0}55%{transform:translateX(-12%) skewX(14deg);opacity:1}78%{transform:translateX(4%) skewX(-6deg)}100%{transform:none;opacity:1}}"
  + "@keyframes ngfPop{0%{transform:scale(.3) rotate(-10deg);opacity:0}70%{transform:scale(1.15);opacity:1}100%{transform:none;opacity:1}}"
  + "@keyframes ngfJelly{0%,100%{transform:none}22%{transform:scale(1.16,.84)}46%{transform:scale(.9,1.14)}70%{transform:scale(1.06,.96)}}"
  + "@keyframes ngfHop{0%,100%{transform:none}40%{transform:translateY(-22%) rotate(-5deg) scale(1.06)}}"
  + "@keyframes ngfPopL{0%{transform:translateY(.7em) scale(.2) rotate(-14deg);opacity:0}60%{transform:translateY(-.3em) scale(1.4) rotate(7deg);opacity:1}100%{transform:none;opacity:1}}";

  g.ngfSplash = function (opts) {
    opts = opts || {};
    var full = 'New Generation Form', timers = [], finished = false;
    var short = opts.short;
    try { if (short === undefined) { short = localStorage.getItem('ngf_splash_seen') === '1'; localStorage.setItem('ngf_splash_seen', '1'); } } catch (e) { short = !!short; }
    var reduce = g.matchMedia && g.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var el = document.createElement('div'); el.className = 'ngf-sp'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'NGF, New Generation Form');
    el.innerHTML = '<div class="k"></div><div class="logo"><span>N</span><span>G</span><span>F</span></div><div class="nm"></div>';
    document.body.appendChild(el);
    var logo = el.querySelector('.logo'), nm = el.querySelector('.nm');
    function later(f, t) { timers.push(setTimeout(f, t)); }
    function end() {
      if (finished) return; finished = true; timers.forEach(clearTimeout);
      el.classList.add('out');
      setTimeout(function () { el.remove(); st.remove(); if (opts.onDone) opts.onDone(); }, 350);
    }
    function type(delay, speed) {
      full.split('').forEach(function (ch, i) {
        later(function () { var l = document.createElement('i'); l.textContent = ch === ' ' ? ' ' : ch; if (ch === ' ') l.className = 'sp'; nm.appendChild(l); }, delay + i * speed);
      });
      return delay + full.length * speed;
    }
    el.addEventListener('click', end);
    if (reduce) { logo.className = 'logo done'; nm.textContent = full; nm.style.color = '#E8C45A'; later(end, 900); }
    else if (short) { logo.className = 'logo quick'; var t = type(450, 22); later(function () { logo.className = 'logo done'; }, 700); later(end, t + 500); }
    else {
      logo.className = 'logo go';
      later(function () { logo.className = 'logo jelly'; }, 2150);
      later(function () { var t = type(0, 55); later(function () { logo.className = 'logo wave'; }, t + 150); later(end, t + 900); }, 2900);
    }
    return { skip: end };
  };
})(window);
