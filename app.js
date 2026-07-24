(() => {
  const app = document.getElementById("app");
  const data = window.GAME_DATA;
  const scenes = Object.fromEntries(data.scenes.map(scene => [scene.id, scene]));
  const SCENE_KEY = "popup_scene_v3";
  const TEAM_KEY = "popup_team_v3";

  const normalize = value => String(value ?? "").trim().replace(/\s+/g, "").toLowerCase();
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));

  let state = {
    sceneId: localStorage.getItem(SCENE_KEY) || "start",
    team: localStorage.getItem(TEAM_KEY) || ""
  };

  function save() {
    localStorage.setItem(SCENE_KEY, state.sceneId);
    localStorage.setItem(TEAM_KEY, state.team);
  }

  function go(sceneId) {
    state.sceneId = sceneId;
    save();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fill(text) {
    return String(text ?? "").replaceAll("{{team}}", state.team || "OO");
  }

  function reset() {
    localStorage.removeItem(SCENE_KEY);
    localStorage.removeItem(TEAM_KEY);
    state = { sceneId: "start", team: "" };
    render();
  }

  function missingMarkup() {
    return `
      <section class="missing-site">
        <header class="site-head">
          <div class="site-logo">FINDING</div>
          <div class="site-small">失蹤人口協尋平台</div>
        </header>

        <div class="photo-rain" aria-hidden="true">
          ${Array.from({length: 8}, (_, index) =>
            `<div class="float-photo p${(index % 4) + 1}" style="--i:${index}"></div>`
          ).join("")}
        </div>

        <div class="poster-wrap">
          <article class="poster">
            <div class="poster-title">尋人啟事</div>
            <div class="poster-sub">帕普一家失蹤</div>
            <div class="missing-main-photo"></div>
            <div class="poster-copy">
              帕普一家於昨日進入光之電影院後失去聯絡。若您願意協助尋找，請按下方按鈕與家屬聯繫。
            </div>
            <button class="help-btn" id="helpBtn" type="button">我要協尋</button>
          </article>
        </div>
      </section>`;
  }

  function renderMissingHome() {
    app.innerHTML = missingMarkup();

    document.getElementById("helpBtn").addEventListener("click", () => {
      app.insertAdjacentHTML("beforeend", `
        <div class="overlay" id="overlay">
          <div class="modal">
            <h2>請輸入聯絡號碼</h2>
            <input class="phone-input" id="phone" inputmode="numeric" autocomplete="off" maxlength="8">
            <div class="feedback" id="phoneFeedback"></div>
            <button class="modal-btn" id="callBtn" type="button">撥打電話</button>
          </div>
        </div>`);

      document.getElementById("callBtn").addEventListener("click", () => {
        const phone = document.getElementById("phone").value;
        if (normalize(phone) !== "90970915") {
          document.getElementById("phoneFeedback").textContent = "聯絡號碼不正確。";
          return;
        }

        document.getElementById("overlay").innerHTML = `
          <div class="modal">
            <div class="calling-icon">☎</div>
            <div class="calling-name">正在為您接通帕普・寇恩</div>
            <div class="dots"><i></i><i></i><i></i></div>
          </div>`;

        window.setTimeout(() => go("corn_1"), 2200);
      });
    });
  }

  function renderPhoneDialogue(scene) {
    const player = scene.speaker === "你們";
    app.innerHTML = `
      <section class="phone-scene">
        <div class="phone-status">與帕普・寇恩通話中</div>
        <div class="dialogue-sheet">
          <div class="dialogue-inner">
            <div class="speaker-tag ${player ? "player" : "corn"}">${escapeHtml(scene.speaker)}</div>
            <div class="dialogue-text">${escapeHtml(fill(scene.text))}</div>
            ${scene.teamInput ? `
              <div class="team-box">
                <input id="teamInput" maxlength="24" placeholder="請輸入你們的團隊名稱">
                <button class="reply-btn" id="replyBtn" type="button">確認團隊名稱</button>
              </div>` : `
              <button class="reply-btn" id="replyBtn" type="button">${escapeHtml(scene.reply || "繼續")}</button>`
            }
          </div>
        </div>
      </section>`;

    document.getElementById("replyBtn").addEventListener("click", () => {
      if (scene.teamInput) {
        const team = document.getElementById("teamInput").value.trim();
        if (!team) return;
        state.team = team;
        save();
      }
      go(scene.next);
    });
  }

  function renderTheaterGate() {
    app.innerHTML = `
      <section class="theater-gate" id="theaterGate">
        <div class="gate-vignette"></div>
        <div class="gate-content">
          <p class="glowing-instruction">請打開盒子，進入光之電影院</p>
          <button class="gold-button" id="enterTheater" type="button">我已進入光之電影院</button>
        </div>
      </section>`;

    document.getElementById("enterTheater").addEventListener("click", () => {
      const gate = document.getElementById("theaterGate");
      gate.classList.add("zooming-in");
      window.setTimeout(() => go("theater_hub"), 1350);
    });
  }

  function theaterInteriorMarkup() {
    return `
      <section class="theater-interior">
        <div class="cinema-sign">光之電影院</div>

        <div class="booth ticket-booth">
          <div class="booth-sign">售票口</div>
          <div class="booth-window"><span>丘洛</span></div>
        </div>

        <div class="booth check-booth">
          <div class="booth-sign">驗票口</div>
          <div class="booth-window"><span>哈斗哥</span></div>
        </div>

        <div class="red-carpet"></div>
        <div class="dark-corridor"></div>

        <div class="hub-question">
          <h1>要與誰進行對話？</h1>
          <input id="characterAnswer" autocomplete="off" placeholder="請輸入角色名稱">
          <div class="hub-feedback" id="hubFeedback"></div>
          <button class="gold-button compact" id="characterSubmit" type="button">確認</button>
        </div>
      </section>`;
  }

  function renderTheaterHub() {
    app.innerHTML = theaterInteriorMarkup();
    const submit = () => {
      const answer = normalize(document.getElementById("characterAnswer").value);
      const feedback = document.getElementById("hubFeedback");

      let destination = "";
      let zoomClass = "";
      if (["哈斗哥", "哈鬥哥", "hotdog"].some(value => normalize(value) === answer)) {
        destination = "hotdog_dialogue";
        zoomClass = "zoom-right";
      } else if (["丘洛", "churro"].some(value => normalize(value) === answer)) {
        destination = "churro_dialogue";
        zoomClass = "zoom-left";
      }

      if (!destination) {
        feedback.textContent = "這裡似乎沒有這個人。";
        return;
      }

      const scene = document.querySelector(".theater-interior");
      scene.classList.add(zoomClass);
      window.setTimeout(() => go(destination), 1100);
    };

    document.getElementById("characterSubmit").addEventListener("click", submit);
    document.getElementById("characterAnswer").addEventListener("keydown", event => {
      if (event.key === "Enter") submit();
    });
  }

  function characterClass(name) {
    if (name === "哈斗哥") return "hotdog";
    if (name === "丘洛") return "churro";
    return "corn-character";
  }

  function renderCharacterDialogue(scene) {
    let lineIndex = 0;

    function drawLine() {
      const line = scene.lines[lineIndex];
      const playerSpeaking = line.speaker === "你們";
      const mainActive = line.speaker === scene.character;
      const cornActive = line.speaker === "寇恩";

      app.innerHTML = `
        <section class="conversation-scene ${scene.location === "售票口" ? "ticket-location" : "check-location"}">
          <div class="conversation-sign">${escapeHtml(scene.location)}</div>

          <div class="character character-left ${cornActive ? "active" : "dim"}">
            <div class="character-portrait corn-character">
              <div class="character-emoji">🍿</div>
            </div>
            <div class="character-name">寇恩</div>
          </div>

          <div class="character character-right ${mainActive ? "active" : "dim"}">
            <div class="character-portrait ${characterClass(scene.character)}">
              <div class="character-emoji">${scene.character === "丘洛" ? "🥨" : "🌭"}</div>
            </div>
            <div class="character-name">${escapeHtml(scene.character)}</div>
          </div>

          <button class="game-dialogue-box ${playerSpeaking ? "player-line" : ""}" id="dialogueNext" type="button">
            <span class="dialogue-speaker">${escapeHtml(line.speaker)}</span>
            <span class="dialogue-copy">${escapeHtml(line.text)}</span>
            <span class="tap-hint">點擊繼續</span>
          </button>
        </section>`;

      if (playerSpeaking) {
        document.querySelectorAll(".character").forEach(character => {
          character.classList.remove("active");
          character.classList.add("dim");
        });
      }

      document.getElementById("dialogueNext").addEventListener("click", () => {
        lineIndex += 1;
        if (lineIndex >= scene.lines.length) {
          go(scene.next);
        } else {
          drawLine();
        }
      });
    }

    drawLine();
  }

  function renderReward(scene) {
    app.innerHTML = `
      <section class="reward-scene">
        <div class="reward-backdrop"></div>
        <div class="reward-card-wrap">
          <div class="movie-guide-card">
            <div class="guide-heading">光之電影院</div>
            <div class="guide-film">電影簡介表</div>
            <div class="guide-lines"></div>
          </div>
          <p class="reward-copy">
            <span>你們獲得了</span>
            <strong>${escapeHtml(scene.item)}</strong>
          </p>
          <button class="gold-button compact" id="rewardNext" type="button">收下物品</button>
        </div>
      </section>`;

    document.getElementById("rewardNext").addEventListener("click", () => go(scene.next));
  }

  function renderRewardEnd() {
    app.innerHTML = `
      <section class="reward-end">
        <div>
          <p class="eyebrow">目前更新至此</p>
          <h1>電影簡介表已收入道具</h1>
          <p>下一步將接續電影推理與場次選擇。</p>
          <button class="reset-link" id="resetGame" type="button">從頭重新試玩</button>
        </div>
      </section>`;
    document.getElementById("resetGame").addEventListener("click", reset);
  }

  function render() {
    const scene = scenes[state.sceneId] || scenes.start;
    if (scene.type === "missing_home") return renderMissingHome();
    if (scene.type === "phone_dialogue") return renderPhoneDialogue(scene);
    if (scene.type === "theater_gate") return renderTheaterGate();
    if (scene.type === "theater_hub") return renderTheaterHub();
    if (scene.type === "character_dialogue") return renderCharacterDialogue(scene);
    if (scene.type === "reward") return renderReward(scene);
    if (scene.type === "reward_end") return renderRewardEnd();
  }

  render();
})();