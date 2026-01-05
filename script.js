 
    // ----- Dark Mode Toggle -----
    const html = document.documentElement;
    const themeBtn = document.getElementById('toggleThemeBtn');
    const iconSun = document.getElementById('iconSun');
    const iconMoon = document.getElementById('iconMoon');

    function setTheme(isDark) {
      html.classList.toggle('dark', isDark);
      document.body.classList.toggle('dark', isDark);
      iconSun.style.display = isDark ? 'block' : 'none';
      iconMoon.style.display = isDark ? 'none' : 'block';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function detectTheme() {
      const storage = localStorage.getItem('theme');
      if (storage === 'dark') return true;
      if (storage === 'light') return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Set initial
    setTheme(detectTheme());
    themeBtn.onclick = () => setTheme(!html.classList.contains('dark'));

    // --------- Stopwatch logic ----------
    let running = false;
    let startTime = null;
    let elapsed = 0;
    let rafId = null;
    let laps = [];

    const $minutes = document.getElementById('minutes');
    const $seconds = document.getElementById('seconds');
    const $centisec = document.getElementById('centisec');
    const $startBtn = document.getElementById('startBtn');
    const $startLabel = document.getElementById('startLabel');
    const $resetBtn = document.getElementById('resetBtn');
    const $lapBtn = document.getElementById('lapBtn');
    const $noLaps = document.getElementById('noLaps');
    const $lapsTable = document.getElementById('lapsTable');
    const $lapsBody = document.getElementById('lapsBody');
    function formatTime(ms) {
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      const cen = Math.floor((ms % 1000) / 10);
      return {
        min: String(min).padStart(2,'0'),
        sec: String(sec).padStart(2,'0'),
        cen: String(cen).padStart(2,'0'),
        text: `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(cen).padStart(2,'0')}`
      }
    }
    function update() {
      const now = performance.now();
      const ms = elapsed + (now - startTime);
      const {min,sec,cen} = formatTime(ms);
      $minutes.textContent = min;
      $seconds.textContent = sec;
      $centisec.textContent = cen;
      rafId = requestAnimationFrame(update);
    }
    function start() {
      if (running) return;
      running = true;
      startTime = performance.now();
      rafId = requestAnimationFrame(update);
      $startLabel.textContent = 'Stop';
      $resetBtn.disabled = true;
      $lapBtn.disabled = false;
      $startBtn.classList.remove('btn');
      $startBtn.classList.add('btn-secondary');
    }
    function stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(rafId);
      elapsed += performance.now() - startTime;
      $startLabel.textContent = 'Start';
      $resetBtn.disabled = false;
      $lapBtn.disabled = true;
      $startBtn.classList.add('btn');
      $startBtn.classList.remove('btn-secondary');
    }
    function reset() {
      stop();
      elapsed = 0;
      laps = [];
      $minutes.textContent = '00';
      $seconds.textContent = '00';
      $centisec.textContent = '00';
      renderLaps();
      $resetBtn.disabled = true;
    }
    function lap() {
      if (!running) return;
      const now = performance.now();
      const time = elapsed + (now - startTime);
      laps.unshift(formatTime(time).text);
      renderLaps();
    }
    function renderLaps() {
      if (laps.length === 0) {
        $noLaps.style.display = 'block';
        $lapsTable.style.display = 'none';
        $resetBtn.disabled = elapsed === 0;
      } else {
        $noLaps.style.display = 'none';
        $lapsTable.style.display = 'table';
        $lapsBody.innerHTML = '';
        laps.forEach((lap, idx) => {
          const tr = document.createElement('tr');
          if (idx === 0) tr.className = 'lap-highlight';
          tr.innerHTML = `<td>Lap ${laps.length-idx}</td><td>${lap}</td>`;
          $lapsBody.appendChild(tr);
        });
        $resetBtn.disabled = false;
      }
    }

    $startBtn.onclick = () => running ? stop() : start();
    $resetBtn.onclick = reset;
    $lapBtn.onclick = lap;

    document.onkeydown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === "Space" || e.key === " ") { $startBtn.click(); e.preventDefault(); }
      if (e.code === "KeyR" || e.key.toLowerCase() === "r") $resetBtn.click();
      if (e.code === "KeyL" || e.key.toLowerCase() === "l") $lapBtn.click();
    };

    renderLaps();
