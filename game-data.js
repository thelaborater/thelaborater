window.GAME_DATA = {
  "meta": {
    "title": "POP UP！爆米花去哪裡？",
    "version": "0.3.0",
    "scope": "協尋網站至取得電影簡介表"
  },
  "scenes": [
    {
      "id": "start",
      "type": "missing_home"
    },
    {
      "id": "corn_1",
      "type": "phone_dialogue",
      "speaker": "寇恩",
      "text": "⋯⋯您好？",
      "reply": "你好，是帕普家的小兒子嗎？",
      "next": "corn_2"
    },
    {
      "id": "corn_2",
      "type": "phone_dialogue",
      "speaker": "寇恩",
      "text": "我是帕普寇恩沒錯，請問你們是？",
      "teamInput": true,
      "next": "corn_3"
    },
    {
      "id": "corn_3",
      "type": "phone_dialogue",
      "speaker": "你們",
      "text": "我們是 {{team}}，是來幫你尋找你的家人的。",
      "reply": "送出訊息",
      "next": "corn_4"
    },
    {
      "id": "corn_4",
      "type": "phone_dialogue",
      "speaker": "寇恩",
      "text": "真的嗎？太感謝你們了！你們有找到什麼線索嗎？",
      "reply": "目前沒有，我們打算到光之電影院找找看有什麼線索",
      "next": "corn_5"
    },
    {
      "id": "corn_5",
      "type": "phone_dialogue",
      "speaker": "寇恩",
      "text": "很有道理，我也正打算過去，那我們等等在光之電影院見面嗎？",
      "reply": "沒問題",
      "next": "open_box"
    },
    {
      "id": "open_box",
      "type": "theater_gate"
    },
    {
      "id": "theater_hub",
      "type": "theater_hub"
    },
    {
      "id": "hotdog_dialogue",
      "type": "character_dialogue",
      "location": "驗票口",
      "character": "哈斗哥",
      "lines": [
        {
          "speaker": "哈斗哥",
          "text": "現在開放進場的是近期熱映的香港電影《沒有人付錢》！"
        },
        {
          "speaker": "寇恩",
          "text": "我們想來問有關我家米花的事情！"
        },
        {
          "speaker": "哈斗哥",
          "text": "哎呀！狗沒拿賽！"
        },
        {
          "speaker": "哈斗哥",
          "text": "我也很想幫忙，但你們這樣沒頭沒尾的問我，我實在不知道怎麼幫助你們。"
        },
        {
          "speaker": "你們",
          "text": "你對昨天來看電影的爆米花有印象嗎？"
        },
        {
          "speaker": "哈斗哥",
          "text": "有啊！他們就是一群白白的可愛小傢伙！"
        },
        {
          "speaker": "哈斗哥",
          "text": "聞起來有焦糖、巧克力、起司、奶油的味道。"
        },
        {
          "speaker": "哈斗哥",
          "text": "如何？是你們要找的爆米花嗎？"
        },
        {
          "speaker": "你們",
          "text": "聽起來就像是對所有爆米花的敘述一樣⋯⋯"
        },
        {
          "speaker": "哈斗哥",
          "text": "哈哈哈哈哈！說得也是！我真是粗心大意呢！"
        },
        {
          "speaker": "寇恩",
          "text": "那請您讓我進去，我自己去找！"
        },
        {
          "speaker": "哈斗哥",
          "text": "呀勒呀勒！不可以得斯！"
        },
        {
          "speaker": "哈斗哥",
          "text": "要進去的話一定得買票才行！"
        }
      ],
      "next": "theater_hub"
    },
    {
      "id": "churro_dialogue",
      "type": "character_dialogue",
      "location": "售票口",
      "character": "丘洛",
      "lines": [
        {
          "speaker": "丘洛",
          "text": "歡迎來光之電影院，幾位？要看什麼電影？"
        },
        {
          "speaker": "寇恩",
          "text": "請問妳有看到我的家米花嗎？"
        },
        {
          "speaker": "丘洛",
          "text": "啊？誰知道你家拿棒是誰啊？"
        },
        {
          "speaker": "寇恩",
          "text": "就是這些爆米花。"
        },
        {
          "speaker": "丘洛",
          "text": "沒印象。"
        },
        {
          "speaker": "寇恩",
          "text": "那妳知道昨天的爆米花看了什麼電影嗎？"
        },
        {
          "speaker": "丘洛",
          "text": "拜託，我怎麼會知道？"
        },
        {
          "speaker": "丘洛",
          "text": "你知道一整天下來，來看電影的爆米花有幾顆嗎？"
        },
        {
          "speaker": "你們",
          "text": "丘洛小姐，能不能請妳提供一些線索？"
        },
        {
          "speaker": "你們",
          "text": "寇恩真的很著急想要找到他的家人。"
        },
        {
          "speaker": "丘洛",
          "text": "好吧。"
        },
        {
          "speaker": "丘洛",
          "text": "這裡有一張電影簡介表，也許你們能從中找看看有沒有什麼線索。"
        }
      ],
      "next": "movie_guide_reward"
    },
    {
      "id": "movie_guide_reward",
      "type": "reward",
      "item": "電影簡介表",
      "next": "reward_end"
    },
    {
      "id": "reward_end",
      "type": "reward_end"
    }
  ]
};
