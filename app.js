
(() => {
  const app = document.getElementById("app");
  const D = window.GAME_DATA;
  const KEY = "popup_v6_state";
  const defaultState = {
    scene: "missing",
    team: "",
    introIndex: 0,
    firstTalked: {hotdog:false, churro:false},
    secondTalked: {hotdog:false, churro:false},
    hasGuide: false,
    solvedMovie: false,
    solvedTime: false,
    hasTicket: false,
    seats: {},
    activeSeat: null,
    hintViewed: {},
    hallAttempts: 0,
    foundObjects: []
  };
  let state = {...defaultState, ...(JSON.parse(localStorage.getItem(KEY) || "{}"))};
  let hintAttentionTimer = null;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const norm = s => String(s ?? "").trim().replace(/\s+/g,"").toLowerCase();
  const playerName = () => state.team || "你們";
  const shuffled = values => [...values].sort(() => Math.random() - 0.5);
  const fill = s => String(s ?? "").replaceAll("{{team}}", playerName());
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const go = scene => { state.scene = scene; save(); render(); window.scrollTo({top:0, behavior:"smooth"}); };
  const reset = () => { localStorage.removeItem(KEY); state = structuredClone(defaultState); render(); };

  const HINTS = {
    movie: {
      menu: [
        ["noteSchedule","再確認一次帕普家的行蹤"],
        ["notePreference","再確認一次帕普家對電影的喜好"],
        ["movieSpark","靈光一閃"]
      ],
      answer: "《幸福的甜蜜滋味》"
    },
    time: {
      menu: [
        ["notePreference","再確認一次帕普家對電影的喜好"],
        ["timeSpark1","靈光一閃"],
        ["timeSpark2","靈光二閃"]
      ],
      answer: "17:20"
    },
    findings: {
      menu: [["findSpark1","靈光一閃"],["findSpark2","靈光二閃"]],
      answer: "FINDINGS"
    },
    seats: {
      menu: [["seatSpark1","靈光一閃"],["seatSpark2","靈光二閃"]],
      answer: `1A坐的是希可，他帶走了「雪花蒐集冊」<br>
      2A坐的是葛蘭德，他帶走了「管家守則」<br>
      3A坐的是烏拉，他帶走了「貼紙」<br>
      4A坐的是蘿莉，他帶走了「迷宮手札」<br>
      1B坐的是希波，他帶走了「量杯」<br>
      2B坐的是史塔兒，他帶走了「星座大全」<br>
      3B坐的是平，他帶走了「編舞筆記」<br>
      4B坐的是巴柏，他帶走了「泡泡保鮮膜」`
    },
    objects: {
      menu: [["objectSpark1","靈光一閃"],["objectSpark2","靈光二閃"],["objectName","有眼不識泰山"]],
      answer: "把觀眾席整片拿起來"
    },
    filmName: {
      menu: [["objectName","有眼不識泰山"]]
    },
    boats: {
      menu: [["boatsSpark1","靈光一閃"],["boatsSpark2","靈光二閃"]],
      answer: "BOATS"
    },
    rolling: {
      menu: [["rollingSpark1","靈光一閃"],["rollingSpark2","靈光二閃"]],
      answer: "ROLLING"
    }
  };

  const NOTE_CONTENT = {
    noteSchedule: {
      title:"帕普家的行蹤",
      body:`媽媽說她下午3點要去逛水晶市集4點半才會回家<br>
      烏拉早上10點會待在家裡看播一個小時的卡通<br>
      爺爺每天晚上10點一定要上床睡覺<br>
      希波早上8點會去實驗室，至少會待2個小時<br>
      中午12點到下午1點半是平的練舞時間<br>
      爸爸昨天好像沒什麼行程的樣子<br>
      史塔兒下午2點半跟晚上8點都有客人，每次時間半個小時<br>
      希可去北極探險了，前天晚上9點上飛機，應該10個小時後飛回來`
    },
    notePreference: {
      title:"帕普家對電影的喜好",
      body:`寇恩不看片長超過兩小時的電影<br>
      史塔兒對所有海報有星星的電影都會感興趣<br>
      爸爸不喜歡燒腦片<br>
      希可對有冒險元素的電影情有獨鍾<br>
      爺爺不敢看太血腥的電影<br>
      烏拉還小，只要電影出品商名字有英文就會笑得很開心<br>
      平只要看到電影裡有小偷就會渾身不自在<br>
      恐怖片媽媽都不會參與，就算只有一點點恐怖也不行<br>
      希波對劇情片沒什麼興趣`
    },
    movieSpark: {
      title:"靈光一閃",
      small:"",
      body:"似乎只要觀察電影的資訊，對照帕普家對電影的喜好，就能找出他們今天看的電影了"
    },
    timeSpark1: {
      title:"靈光一閃",
      small:"要怎麼知道帕普家幾點有空？",
      body:"只要對照帕普家的行蹤，應該就能找出他們有空的時間了"
    },
    timeSpark2: {
      title:"靈光二閃",
      small:"要怎麼知道電影的放映場次",
      body:"似乎只要知道電影的開場時間，就能推算出電影當天的所有放映時間"
    },
    findSpark1: {
      title:"靈光一閃",
      small:"要怎麼知道觀眾席底部出現了什麼？",
      body:"看來我們得照哈斗哥的指示，把座位往下壓了"
    },
    findSpark2: {
      title:"靈光二閃",
      small:"我想知道把座位往下壓長怎樣",
      image:true
    },
    seatSpark1: {
      title:"靈光一閃",
      small:"怎麼知道這是誰的座位？",
      body:"觀察票根以及後面的簽名應該就可以知道了"
    },
    seatSpark2: {
      title:"靈光二閃",
      small:"怎麼知道這個人遺失了什麼物品？",
      body:"觀察票根背景以及座位底部的物品，用排除法就可以知道了"
    },
    objectSpark1: {
      title:"靈光一閃",
      small:"要怎麼把電影院翻遍？",
      body:"更準確來說應該是要翻遍觀眾席"
    },
    objectSpark2: {
      title:"靈光二閃",
      small:"翻遍是什麼意思？",
      body:"翻遍應該就是翻過來的意思吧？"
    },
    objectName: {
      title:"有眼不識泰山",
      small:"我不知道我拿到的東西叫什麼名字",
      body:"這是「膠片」"
    },
    boatsSpark1: {
      title:"靈光一閃",
      small:"要怎麼看到五個英文字母？",
      body:"似乎只要把膠片整理好就能看到"
    },
    boatsSpark2: {
      title:"靈光二閃",
      small:"膠片要怎麼操作？",
      body:"膠片整理好就是疊在一起吧？"
    },
    rollingSpark1: {
      title:"靈光一閃",
      small:"如何獲得指令？",
      body:"請拉開紅色帷幕"
    },
    rollingSpark2: {
      title:"靈光二閃",
      small:"如何拉開紅色帷幕？",
      body:"請將紅色帷幕的酷卡抽出"
    }
  };

  function popcornHint(key) {
    return `<button class="hint-popcorn" type="button" data-hint="${esc(key)}" aria-label="提示"><span>🍿</span></button>`;
  }

  function bindHintButtons() {
    clearTimeout(hintAttentionTimer);
    const buttons = [...document.querySelectorAll("[data-hint]")];
    buttons.forEach(btn => {
      btn.classList.remove("hint-attention");
      btn.onclick = () => openHintMenu(btn.dataset.hint);
    });
    if(buttons.length){
      hintAttentionTimer = setTimeout(() => {
        buttons.forEach(btn => btn.classList.add("hint-attention"));
      }, 20 * 60 * 1000);
    }
  }

  function openHintMenu(key) {
    const config = HINTS[key];
    if (!config) return;
    const answerUnlocked = !!state.hintViewed[key];
    document.body.insertAdjacentHTML("beforeend", `
      <div class="hint-overlay" id="hintOverlay">
        <section class="hint-menu-card">
          <button class="hint-close" id="hintClose">×</button>
          <div class="hint-title">爆米花提示</div>
          <div class="hint-menu-buttons">
            ${config.menu.map(([id,label])=>`<button data-hint-item="${id}">${esc(label)}</button>`).join("")}
            ${answerUnlocked && config.answer ? `<button data-hint-answer="${key}">答案</button>` : ""}
          </div>
        </section>
      </div>`);
    document.getElementById("hintClose").onclick = closeHint;
    document.querySelectorAll("[data-hint-item]").forEach(btn => btn.onclick = () => {
      const id = btn.dataset.hintItem;
      if(id.startsWith("note")) showNotebook(id, key, false);
      else confirmHint(id, key);
    });
    document.querySelector("[data-hint-answer]")?.addEventListener("click", () => confirmAnswer(key));
  }

  function closeHint() {
    document.getElementById("hintOverlay")?.remove();
  }

  function confirmHint(id, key) {
    const note = NOTE_CONTENT[id];
    document.getElementById("hintOverlay").innerHTML = `
      <section class="hint-menu-card">
        <button class="hint-close" id="hintClose">×</button>
        <div class="hint-title">確定要觀看提示嗎？</div>
        ${note.small ? `<div class="hint-small">${esc(note.small)}</div>` : ""}
        <button class="hint-confirm" id="hintConfirm">確認</button>
      </section>`;
    document.getElementById("hintClose").onclick = closeHint;
    document.getElementById("hintConfirm").onclick = () => showNotebook(id, key, true);
  }

  function showNotebook(id, key, unlock) {
    const note = NOTE_CONTENT[id];
    if(unlock) {
      state.hintViewed[key] = true;
      save();
    }
    document.getElementById("hintOverlay").innerHTML = `
      <section class="notebook-card">
        <button class="hint-close" id="hintClose">×</button>
        <h2>${esc(note.title)}</h2>
        ${note.image ? `<div class="seat-hint-photo"><div class="seat-hint-chair">座位往下壓示意圖</div></div>` :
          `<div class="handwriting">${note.body}</div>`}
        <button class="hint-back" id="hintBack">返回</button>
      </section>`;
    document.getElementById("hintClose").onclick = closeHint;
    document.getElementById("hintBack").onclick = () => openHintMenuAfterReplace(key);
  }

  function openHintMenuAfterReplace(key) {
    closeHint();
    openHintMenu(key);
  }

  function confirmAnswer(key) {
    document.getElementById("hintOverlay").innerHTML = `
      <section class="hint-menu-card">
        <button class="hint-close" id="hintClose">×</button>
        <div class="hint-title">確定要觀看答案嗎？</div>
        <button class="hint-confirm" id="answerConfirm">確定</button>
      </section>`;
    document.getElementById("hintClose").onclick = closeHint;
    document.getElementById("answerConfirm").onclick = () => showAnswerNote(key);
  }

  function showAnswerNote(key) {
    const answer = HINTS[key].answer;
    document.getElementById("hintOverlay").innerHTML = `
      <section class="notebook-card">
        <button class="hint-close" id="hintClose">×</button>
        <h2>答案</h2>
        <div class="handwriting answer-note">${answer}</div>
        <button class="hint-back" id="hintBack">返回</button>
      </section>`;
    document.getElementById("hintClose").onclick = closeHint;
    document.getElementById("hintBack").onclick = () => openHintMenuAfterReplace(key);
  }

  function missingMarkup() {
    const photos = Array.from({length:12}, (_,i) => {
      const left = [4,19,34,55,72,86,10,44,66,79,27,91][i];
      const delay = [-2,-9,-16,-4,-12,-19,-7,-14,-1,-11,-17,-5][i];
      const duration = [14,20,17,23,18,21,16,24,19,15,22,18][i];
      const rot = [-11,7,-4,12,-8,4,9,-6,3,-13,6,-2][i];
      const scale = [.85,1.12,.92,1.22,.78,1.05,1.18,.88,1.08,.82,1.15,.96][i];
      return `<div class="float-photo p${(i%4)+1}" style="left:${left}%;--delay:${delay}s;--duration:${duration}s;--rot:${rot}deg;--scale:${scale}"></div>`;
    }).join("");
    return `
    <section class="missing-site">
      <header class="site-head"><div class="site-logo">FINDING</div><div class="site-small">失蹤人口協尋平台</div></header>
      <div class="photo-rain">${photos}</div>
      <div class="poster-wrap">
        <article class="poster">
          <div class="poster-title">尋人啟事</div>
          <div class="poster-sub">帕普一家失蹤</div>
          <div class="missing-main-photo"></div>
          <p>帕普一家於昨日進入光之電影院後失去聯絡。若您願意協助尋找，請與家屬聯繫。</p>
          <button class="help-btn" id="helpBtn">我要協尋</button>
        </article>
      </div>
    </section>`;
  }

  function renderMissing() {
    app.innerHTML = missingMarkup();
    document.getElementById("helpBtn").onclick = () => {
      app.insertAdjacentHTML("beforeend", `
        <div class="overlay" id="overlay">
          <div class="modal">
            <h2>請輸入聯絡號碼</h2>
            <input id="phone" inputmode="numeric" maxlength="8" autocomplete="off">
            <div class="feedback" id="phoneFeedback"></div>
            <button id="callBtn">撥打電話</button>
          </div>
        </div>`);
      document.getElementById("callBtn").onclick = () => {
        if(norm(document.getElementById("phone").value) !== "90970915") {
          document.getElementById("phoneFeedback").textContent = "聯絡號碼不正確。";
          return;
        }
        document.getElementById("overlay").innerHTML = `
          <div class="modal calling">
            <div class="calling-icon">☎</div>
            <strong>正在為您接通帕普・寇恩</strong>
            <div class="dots"><i></i><i></i><i></i></div>
          </div>`;
        setTimeout(() => { state.introIndex=0; go("phone"); }, 1900);
      };
    };
  }

  function renderPhone() {
    const lines = D.intro.phone;
    const line = lines[state.introIndex];
    const isPlayer = line.speaker === "player";
    app.innerHTML = `
      <section class="phone-scene">
        <div class="phone-status">與帕普・寇恩通話中</div>
        <div class="dialogue-sheet">
          <div class="speaker-tag ${isPlayer?"player":"corn"}">${isPlayer?esc(playerName()):esc(line.speaker)}</div>
          <div class="dialogue-text">${esc(fill(line.text))}</div>
          ${line.teamInput ? `
            <input class="team-input" id="teamInput" placeholder="請輸入你們的團隊名稱" maxlength="24">
            <button class="reply-btn" id="phoneNext">確認團隊名稱</button>` :
            `<button class="reply-btn" id="phoneNext">${esc(line.reply || "繼續")}</button>`}
        </div>
      </section>`;
    document.getElementById("phoneNext").onclick = () => {
      if(line.teamInput){
        const v = document.getElementById("teamInput").value.trim();
        if(!v) return;
        state.team = v;
      }
      if(state.introIndex === lines.length-1){
        save();
        app.classList.add("fade-out");
        setTimeout(() => { app.classList.remove("fade-out"); go("theaterGate"); }, 700);
        return;
      }
      state.introIndex++;
      save(); render();
    };
  }

  function renderTheaterGate() {
    app.innerHTML = `
      <section class="theater-gate fade-in-scene" id="gate">
        <div class="gate-content">
          <div class="glowing-instruction"><span>請打開盒子</span><span>進入光之電影院</span></div>
          <button class="gold-button" id="enterBtn">我已進入光之電影院</button>
        </div>
      </section>`;
    document.getElementById("enterBtn").onclick = () => {
      document.getElementById("gate").classList.add("zooming");
      setTimeout(() => go("hub"), 1200);
    };
  }

  function hubMarkup() {
    return `
    <section class="theater-interior">
      <div class="cinema-sign">光之電影院</div>
      <div class="booth ticket-booth"><div class="booth-sign">售票口</div><div class="booth-window"></div></div>
      <div class="booth check-booth"><div class="booth-sign">驗票口</div><div class="booth-window"></div></div>
      <div class="red-carpet"></div><div class="dark-corridor"></div>
      <div class="hub-question">
        <h1>要與誰進行對話？</h1>
        <input id="who" autocomplete="off" placeholder="請輸入角色名稱">
        <div class="feedback" id="whoFeedback"></div>
        <button class="gold-button small" id="whoBtn">確認</button>
      </div>
    </section>`;
  }

  function renderHub() {
    app.innerHTML = hubMarkup();
    const submit = () => {
      const who = norm(document.getElementById("who").value);
      let target = "";
      if(["哈斗哥","哈鬥哥","hotdog"].some(x=>norm(x)===who)) target="hotdog";
      if(["丘洛","churro"].some(x=>norm(x)===who)) target="churro";
      if(!target){ document.getElementById("whoFeedback").textContent="這裡似乎沒有這個人。"; return; }

      const el = document.querySelector(".theater-interior");
      el.classList.add(target==="hotdog"?"zoom-right":"zoom-left");
      setTimeout(() => {
        if(!state.hasGuide) {
          runDialogue(D.firstTheater[target], () => {
            state.firstTalked[target]=true;
            if(target==="churro") go("guideReward"); else go("hub");
          }, target);
        } else if(!state.solvedTime) {
          go("clueMenu");
        } else {
          if(target==="churro") {
            if(!state.hasTicket) runDialogue(D.secondTheater.churroTicket, ()=>{state.hasTicket=true;save();go("hub");},"churro", {cornTearAt:3});
            else renderChurroRepeat();
          } else {
            if(!state.hasTicket) runDialogue(D.secondTheater.hotdogNoTicket, ()=>go("hub"),"hotdog");
            else runDialogue(D.secondTheater.hotdogTicket, ()=>go("hallAnswer"),"hotdog");
          }
        }
      }, 950);
    };
    document.getElementById("whoBtn").onclick = submit;
    document.getElementById("who").onkeydown = e => { if(e.key==="Enter") submit(); };
  }

  function runDialogue(lines, onDone, character="corn", opts={}) {
    let i=0;
    const draw = () => {
      const [speaker,text] = lines[i];
      const player = speaker==="player";
      const mainName = character==="hotdog"?"哈斗哥":character==="churro"?"丘洛":"";
      const mainSpeaking = speaker===mainName;
      const cornSpeaking = speaker==="寇恩";
      const tear = opts.cornTearAt === i ? "tearful" : "";
      app.innerHTML = `
        <section class="conversation-scene ${character}">
          <div class="conversation-sign">${character==="hotdog"?"驗票口":character==="churro"?"售票口":"光之電影院"}</div>
          ${mainName ? `
          <div class="character character-left ${cornSpeaking?"active":"dim"} ${tear}">
            <div class="portrait corn"><span>🍿</span></div><b>寇恩</b>
          </div>
          <div class="character character-right ${mainSpeaking?"active":"dim"}">
            <div class="portrait ${character}"><span>${character==="hotdog"?"🌭":"🥨"}</span></div><b>${mainName}</b>
          </div>` : `
          <div class="character character-center ${cornSpeaking?"active":"dim"}">
            <div class="portrait corn"><span>🍿</span></div><b>寇恩</b>
          </div>`}
          <button class="game-dialogue ${player?"player-line":""}" id="nextLine">
            <span class="dialogue-speaker">${player?esc(playerName()):esc(speaker)}</span>
            <span class="dialogue-copy">${esc(text)}</span>
            <span class="tap">點擊繼續</span>
          </button>
        </section>`;
      if(player) document.querySelectorAll(".character").forEach(el=>{el.classList.remove("active");el.classList.add("dim");});
      document.getElementById("nextLine").onclick = () => {
        i++;
        if(i>=lines.length) onDone(); else draw();
      };
    };
    draw();
  }

  function renderGuideReward() {
    reward("電影簡介表", () => {
      state.hasGuide=true; save();
      runDialogue(D.clueDialogue.intro, ()=>go("clueMenu"), "corn");
    }, "電影簡介表");
  }

  function reward(item, onDone, kind="item") {
    app.innerHTML = `
      <section class="reward-scene">
        <div class="reward-card ${kind}">
          <div class="reward-graphic">${kind==="ticket"?"🎟️":kind==="film"?"🎞️":"📄"}</div>
          <p><span>你們獲得了</span><strong>${esc(item)}</strong></p>
          <button class="gold-button small" id="takeItem">收下道具</button>
        </div>
      </section>`;
    document.getElementById("takeItem").onclick = onDone;
  }

  function renderClueMenu() {
    app.innerHTML = `
      <section class="conversation-scene corn-menu">
        <div class="character character-center active"><div class="portrait corn"><span>🍿</span></div><b>寇恩</b></div>
        <div class="choice-panel">
          <button data-choice="schedule">再說一次他們今天的行蹤</button>
          <button data-choice="preference">再說一次他們喜歡看什麼樣的電影</button>
          <button data-choice="answer">我知道他們看的是什麼電影了</button>
        </div>
      </section>`;
    document.querySelectorAll("[data-choice]").forEach(btn => btn.onclick = () => {
      const c=btn.dataset.choice;
      if(c==="schedule") runDialogue(D.clueDialogue.scheduleRepeat, ()=>go("clueMenu"), "corn");
      if(c==="preference") runDialogue(D.clueDialogue.preferenceRepeat, ()=>go("clueMenu"), "corn");
      if(c==="answer") runDialogue([["寇恩","真的嗎？他們看了哪一部？"]], ()=>go("movieAnswer"), "corn");
    });
  }

  function answerScreen(title, correct, wrongText, onCorrect, accept=[], hintKey="", extraHtml="") {
    app.innerHTML = `
      <section class="answer-scene">
        <div class="answer-panel">
          <h1>${esc(title)}</h1>
          <input id="answerInput" autocomplete="off">
          <div class="feedback" id="answerFeedback"></div>
          <button class="gold-button small" id="answerBtn">確認答案</button>
          ${extraHtml}
          ${hintKey ? popcornHint(hintKey) : ""}
        </div>
      </section>`;
    bindHintButtons();
    const submit=()=>{
      const value=norm(document.getElementById("answerInput").value);
      const ok=[correct,...accept].some(x=>norm(x)===value);
      if(!ok){document.getElementById("answerFeedback").textContent=wrongText;return;}
      onCorrect();
    };
    document.getElementById("answerBtn").onclick=submit;
    document.getElementById("answerInput").onkeydown=e=>{if(e.key==="Enter")submit();};
  }

  function renderMovieAnswer() {
    answerScreen("他們看了哪一部電影？","幸福的甜蜜滋味","好像不是這一部呢",()=>{
      state.solvedMovie=true;save();
      runDialogue([["寇恩","那他們看的是哪一個場次呢？"]], ()=>go("timeMenu"), "corn");
    },["《幸福的甜蜜滋味》"],"movie");
  }

  function renderTimeMenu() {
    app.innerHTML = `
      <section class="conversation-scene corn-menu">
        <div class="character character-center active"><div class="portrait corn"><span>🍿</span></div><b>寇恩</b></div>
        <div class="choice-panel">
          <button id="repeatSchedule">再說一次他們今天的行蹤</button>
          <button id="timeAnswer">他們看的場次就是⋯⋯</button>
        </div>
      </section>`;
    document.getElementById("repeatSchedule").onclick=()=>runDialogue(D.clueDialogue.scheduleRepeat,()=>go("timeMenu"),"corn");
    document.getElementById("timeAnswer").onclick=()=>go("timeAnswer");
  }

  function renderTimeAnswer() {
    answerScreen("他們看的場次就是⋯⋯","17:20","好像不是這個時間呢",()=>{
      state.solvedTime=true;save();
      runDialogue([["寇恩","原來如此！那我們趕快去影廳內看看？"]], ()=>go("hub"), "corn");
    },["1720","下午5:20","下午0520","下午5點20分","5:20PM","05:20PM","0520PM","PM5:20","PM05:20","PM0520"],"time");
  }

  function renderChurroRepeat() {
    runDialogue(D.secondTheater.churroRepeat, ()=>{
      app.innerHTML = `
      <section class="conversation-scene churro">
        <div class="character character-center active"><div class="portrait churro"><span>🥨</span></div><b>丘洛</b></div>
        <div class="choice-panel">
          <button id="know">我知道了</button>
          <button id="forgot">我們忘記他們在第幾影廳了</button>
        </div>
      </section>`;
      document.getElementById("know").onclick=()=>go("hub");
      document.getElementById("forgot").onclick=()=>runDialogue([["丘洛","唉，第18影廳啦！"]],()=>go("hub"),"churro");
    },"churro");
  }

  function renderHallAnswer() {
    answerScreen(
      "他們在第幾影廳？",
      "第18影廳",
      "",
      () => {},
      ["18","18影廳"],
      "",
      `<button class="secondary-answer-btn" id="forgotHall">我忘記了</button>`
    );
    document.getElementById("forgotHall").onclick = () => go("hub");
    document.getElementById("answerBtn").onclick = () => {
      const v = norm(document.getElementById("answerInput").value);
      if(["第18影廳","18","18影廳"].some(x=>norm(x)===v)){
        state.hallAttempts = 0;
        save();
        runDialogue(D.secondTheater.hallCorrect,()=>reward("票根",()=>go("hall18Intro"),"ticket"),"hotdog");
      } else {
        state.hallAttempts = (state.hallAttempts || 0) + 1;
        save();
        document.getElementById("answerFeedback").textContent =
          state.hallAttempts > 10 ? "還是我們回去問問看售票員好了？" : "不是這個影廳吧";
      }
    };
  }

  function renderHall18Intro() {
    app.innerHTML = `<section class="hall18 zoom-arrival" id="hall18"></section>`;
    setTimeout(()=>runDialogue(D.hall18.intro,()=>go("findingsAnswer"),"corn"),900);
  }

  function renderFindingsAnswer() {
    answerScreen("觀眾席底部出現了⋯⋯","FINDINGS","似乎出現的不是這個⋯⋯",()=>{
      runDialogue(D.hall18.afterFindings,()=>go("seatMap"),"corn");
    },[],"findings");
  }

  function seatOptions(selected="") {
    return Object.keys(D.seats).map(key=>D.seats[key].person).filter((v,i,a)=>a.indexOf(v)===i)
      .map(v=>`<option ${v===selected?"selected":""}>${esc(v)}</option>`).join("");
  }

  function renderSeatMap() {
    const doneCount=Object.keys(state.seats).length;
    app.innerHTML=`
      <section class="seat-map-scene">
        <div class="screen-graphic">電影螢幕</div>
        <div class="seat-grid">
          ${Object.keys(D.seats).map(id=>`
            <button class="seat ${state.seats[id]?"done":""}" data-seat="${id}">
              <span>${id}</span>${state.seats[id]?'<small>✓</small>':''}
            </button>`).join("")}
        </div>
        <div class="corn-thinking"><span>🍿</span><div>到底是什麼東西不見了？</div></div>
        <button class="gold-button small check-all" id="checkSeats">請寇恩檢查（${doneCount}/8）</button>
        ${popcornHint("seats")}
      </section>`;
    bindHintButtons();
    document.querySelectorAll("[data-seat]").forEach(btn=>btn.onclick=()=>{state.activeSeat=btn.dataset.seat;save();go("seatEditor");});
    document.getElementById("checkSeats").onclick=()=>{
      if(Object.keys(state.seats).length<8){
        runDialogue([["寇恩","你根本還沒核對完大家的身份嘛！"]],()=>go("seatMap"),"corn");
        return;
      }
      const all=Object.entries(D.seats).every(([id,s])=>state.seats[id]?.person===s.person && state.seats[id]?.item===s.missing);
      if(!all) runDialogue([["寇恩","好像不太對耶。"]],()=>go("seatMap"),"corn");
      else runDialogue(D.hall18.afterSeats,()=>go("objectAnswer1"),"corn");
    };
  }

  function renderSeatEditor() {
    const id=state.activeSeat, existing=state.seats[id]||{};
    const people=shuffled([...new Set(Object.values(D.seats).map(x=>x.person))]);

    function itemOptions(person, selected="") {
      const seatData = Object.values(D.seats).find(x=>x.person===person);
      const items = shuffled(seatData ? seatData.items : []);
      return `<option value="">請選擇</option>` + items.map(v=>`<option ${v===selected?"selected":""}>${esc(v)}</option>`).join("");
    }

    app.innerHTML=`
      <section class="seat-editor">
        <div class="seat-editor-overlay"></div>
        <div class="seat-detail">
          <h2>${id} 座位</h2>
          <label>這是誰的座位？</label>
          <select id="personSelect"><option value="">請選擇</option>${people.map(v=>`<option ${v===existing.person?"selected":""}>${esc(v)}</option>`).join("")}</select>
          <label>不見的物品是？</label>
          <select id="itemSelect">${itemOptions(existing.person, existing.item)}</select>
          <button class="gold-button small" id="seatDone">身份確認完成</button>
        </div>
      </section>`;

    const personSelect=document.getElementById("personSelect");
    const itemSelect=document.getElementById("itemSelect");
    personSelect.onchange=()=>{ itemSelect.innerHTML=itemOptions(personSelect.value); };

    document.getElementById("seatDone").onclick=()=>{
      const person=personSelect.value;
      const item=itemSelect.value;
      if(!person||!item)return;
      state.seats[id]={person,item};save();go("seatMap");
    };
  }

  function renderObjectAnswer1() {
    answerScreen("你有找到什麼嗎？","","好像不是這個⋯⋯",()=>{},[],"objects");
    document.getElementById("answerBtn").onclick=()=>handleObjectDiscovery(document.getElementById("answerInput").value);
  }

  function handleObjectDiscovery(raw) {
    const value=norm(raw);
    const envelopeAnswers=["信封袋","信封","場記板"];
    const filmAnswers=["膠卷","菲林片","菲林膠卷","菲林膠片","膠片"];
    let type="";
    if(envelopeAnswers.some(x=>norm(x)===value)) type="envelope";
    if(filmAnswers.some(x=>norm(x)===value)) type="film";
    if(!type){
      document.getElementById("answerFeedback").textContent="好像不是這個⋯⋯";
      return;
    }
    if(!state.foundObjects.includes(type)) state.foundObjects.push(type);
    save();
    const lines = type==="envelope" ? D.hall18.envelope : D.hall18.film;
    const next = state.foundObjects.length>=2 ? "boatsAnswer" : "objectAnswer2";
    runDialogue(lines,()=>go(next),"corn");
  }

  function renderObjectAnswer2() {
    answerScreen("再找找看，還有什麼？","","好像不是這個⋯⋯",()=>{},[],"filmName");
    document.getElementById("answerInput").placeholder = "請輸入你找到的物品";
    document.getElementById("answerBtn").onclick=()=>handleObjectDiscovery(document.getElementById("answerInput").value);
  }

  function renderBoatsAnswer() {
    answerScreen("我好像看到了五個英文字母⋯⋯","BOATS","是我眼花了嗎？好像不是這個⋯⋯",()=>{
      go("curtainAwake");
    },[],"boats");
  }

  function renderCurtainAwake() {
    app.innerHTML=`
      <section class="curtain-scene">
        <div class="red-curtains"><div></div><div></div></div>
        <div class="screen-glow"></div>
      </section>`;
    setTimeout(()=>runDialogue(D.hall18.curtain,()=>{
      app.innerHTML=`
        <section class="curtain-scene">
          <div class="red-curtains"><div></div><div></div></div>
          <button class="gold-button curtain-btn" id="openCurtain">我已拉開紅色帷幕</button>
        </section>`;
      document.getElementById("openCurtain").onclick=()=>go("rollingAnswer");
    },"corn"),500);
  }

  function renderRollingAnswer() {
    app.innerHTML=`
      <section class="black-stage">
        <div class="rolling-panel">
          <input id="rollingInput" placeholder="輸入指令" autocomplete="off">
          <button id="rollingBtn">確認</button>
          ${popcornHint("rolling")}
        </div>
      </section>`;
    bindHintButtons();
    const submit=()=>{
      const input=document.getElementById("rollingInput");
      if(norm(input.value)!=="rolling"){
        let error=document.getElementById("rollingError");
        if(!error){
          input.insertAdjacentHTML("afterend",`<div class="rolling-error" id="rollingError">指令錯誤</div>`);
        }
        input.classList.add("wrong-flash"); input.value="";
        setTimeout(()=>input.classList.remove("wrong-flash"),500); return;
      }
      runDialogue(D.hall18.rolling,()=>go("whiteFlash"),"corn");
    };
    document.getElementById("rollingBtn").onclick=submit;
    document.getElementById("rollingInput").onkeydown=e=>{if(e.key==="Enter")submit();};
  }

  function renderWhiteFlash() {
    app.innerHTML=`
      <section class="white-flash-scene">
        <div class="chaos-corn">🍿</div>
        <div class="chaos-text">啊啊啊啊啊！</div>
      </section>`;
    setTimeout(()=>go("blackEnd"),2200);
  }

  function renderBlackEnd() {
    app.innerHTML=`
      <section class="black-end">
        <div>
          <p>畫面陷入一片黑暗</p>
          <button id="resetBtn">從頭重新試玩</button>
        </div>
      </section>`;
    document.getElementById("resetBtn").onclick=reset;
  }

  function render() {
    const map={
      missing:renderMissing, phone:renderPhone, theaterGate:renderTheaterGate, hub:renderHub,
      guideReward:renderGuideReward, clueMenu:renderClueMenu, movieAnswer:renderMovieAnswer,
      timeMenu:renderTimeMenu, timeAnswer:renderTimeAnswer, hallAnswer:renderHallAnswer,
      hall18Intro:renderHall18Intro, findingsAnswer:renderFindingsAnswer, seatMap:renderSeatMap,
      seatEditor:renderSeatEditor, objectAnswer1:renderObjectAnswer1, objectAnswer2:renderObjectAnswer2,
      boatsAnswer:renderBoatsAnswer, curtainAwake:renderCurtainAwake, rollingAnswer:renderRollingAnswer,
      whiteFlash:renderWhiteFlash, blackEnd:renderBlackEnd
    };
    (map[state.scene]||renderMissing)();
  }
  render();
})();