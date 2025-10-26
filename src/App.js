import React, { useState } from "react";
import "./App.css";
import WordPopup from "./components/WordPopup";
import AdBanner from "./components/AdBanner";

function App() {
  const [lang, setLang] = useState("en");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const texts = {
    en: {
      greeting: "May your day be filled with the Lord’s peace, grace, and joy. 🌿",
      toggle: "한글 보기",
      title: "Today’s Word from the Lord",
      button: "Show Today's Word",
      footer1: "Awaken your spirit with a humble heart,",
      footer2: "and feel the Lord who dwells within you.",
      footer3: "The Holy Spirit speaks through our conscience. - Amen -",
    },
    ko: {
      greeting: "오늘 하루도 주님의 평안과 은혜 안에서 기쁨이 가득하시길 기원드립니다 🌿",
      toggle: "English",
      title: "오늘 내게 주시는 주님의 말씀",
      button: "말씀 보기",
      footer1: "욕심 없는 마음 성령을 깨우고,",
      footer2: "나의 영에 함께하는 주님을 깨우세요.",
      footer3: "성령은 우리의 양심을 통해 말씀하십니다. - 아멘 -",
    },
  };

  const toggleLang = () => setLang(lang === "en" ? "ko" : "en");

  return (
    <div className="app-container">
      <header className="header">
        <p className="greeting">{texts[lang].greeting}</p>
        <button className="lang-toggle" onClick={toggleLang}>
          {texts[lang].toggle}
        </button>
      </header>

      <main>
        <h1 className="title">{texts[lang].title}</h1>
        <img src="/jesus.jpg" alt="Jesus" className="jesus-image" />
        <button className="show-word" onClick={() => setIsPopupOpen(true)}>
          {texts[lang].button}
        </button>
      </main>

      <footer className="footer">
        <p>{texts[lang].footer1}</p>
        <p>{texts[lang].footer2}</p>
        <p>{texts[lang].footer3}</p>
      </footer>

      {isPopupOpen && (
        <WordPopup lang={lang} onClose={() => setIsPopupOpen(false)} />
      )}
      <AdBanner />
    </div>
  );
}

export default App;
