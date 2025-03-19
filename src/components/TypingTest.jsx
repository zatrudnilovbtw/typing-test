import { useState, useEffect, useRef } from "react";
import { codingExamples } from "./data/words";
import "./TypingTest.css";

const TypingTest = () => {
  const [language, setLanguage] = useState("python");
  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selectedTime, setSelectedTime] = useState(60);
  const [selectedSentences, setSelectedSentences] = useState(5);
  const [testFinished, setTestFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const textRef = useRef(null);

  const getRandomExamples = (language, count) => {
    const examples = codingExamples[language];
    const uniqueExamples = new Set();
    while (uniqueExamples.size < Math.min(count, examples.length)) {
      const randomIndex = Math.floor(Math.random() * examples.length);
      uniqueExamples.add(examples[randomIndex]);
    }
    return Array.from(uniqueExamples).join(" ");
  };

  useEffect(() => {
    // Устанавливаем текст с фиксированной высотой контейнера
    const newText = getRandomExamples(language, selectedSentences);
    setTextToType(newText);
    // Сбрасываем ввод, чтобы избежать мерцания
    setUserInput("");
  }, [language, selectedSentences]);

  useEffect(() => {
    let timer;
    if (startTime && !testFinished) {
      timer = setInterval(() => {
        const currentTime = Date.now();
        const timeElapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(timeElapsed);

        if (timeElapsed >= selectedTime) {
          finishTest();
        } else if (userInput.length > 0) {
          const words = userInput.trim().split(/\s+/).filter(Boolean).length;
          const timeInMinutes = timeElapsed / 60;
          setWpm(Math.round(words / timeInMinutes));
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [startTime, userInput, selectedTime, testFinished]);

  useEffect(() => {
    const handleKeyShortcuts = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "r") {
          e.preventDefault();
          resetTest();
        }
      }
    };
    window.addEventListener("keydown", handleKeyShortcuts);
    return () => window.removeEventListener("keydown", handleKeyShortcuts);
  }, []);

  const handleKeyDown = (e) => {
    if (testFinished || e.key === "Tab" || e.key === "Enter") return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (e.key === "Backspace") {
      setUserInput((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setUserInput((prev) => prev + e.key);
      if (e.key === " ") e.preventDefault();
      if (userInput.length < textToType.length && e.key !== textToType[userInput.length]) {
        setMistakes((prev) => prev + 1);
      }
    }

    if (userInput.length + 1 === textToType.length && e.key !== "Backspace") {
      finishTest();
    }
  };

  const resetTest = () => {
    const newText = getRandomExamples(language, selectedSentences);
    setTextToType(newText);
    setUserInput("");
    setStartTime(null);
    setWpm(0);
    setElapsedTime(0);
    setMistakes(0);
    setTestFinished(false);
    setShowResults(false);
    textRef.current.focus();
  };

  const finishTest = () => {
    setTestFinished(true);
    setStartTime(null);
    setShowResults(true);
  };

  const calculateAccuracy = () => {
    if (textToType.length === 0) return 0;
    const correctChars = userInput.split('').filter((char, i) => char === textToType[i]).length;
    return Math.round((correctChars / textToType.length) * 100);
  };

  const renderText = () => {
    return textToType.split("").map((char, index) => {
      let color = "default";
      const isCurrentPosition = index === userInput.length;

      if (index < userInput.length) {
        color = userInput[index] === char ? "correct" : "incorrect";
      }

      return (
        <span key={index} className={color}>
          {isCurrentPosition && !testFinished && <span className="cursor"></span>}
          {char}
        </span>
      );
    });
  };

  return (
    <div className="container">
        <p className="text">Typing speed test for developers to improve skills or check out the result</p>
      <div className="stats">
        <span>Time: {selectedTime - elapsedTime}s</span>
        <span>WPM: {wpm}</span>
        <span>Mistakes: {mistakes}</span>
      </div>

      <div
        className="text-display"
        tabIndex="0"
        onKeyDown={handleKeyDown}
        ref={textRef}
      >
        {renderText()}
      </div>

      <div className="controls">
        <button
          className="options-toggle"
          onClick={() => setShowOptions(!showOptions)}
        >
          ⚙️ Options
        </button>
        {showOptions && (
          <div className="options-panel">
            <div className="option-group">
              <span>Time:</span>
              {[15, 30, 60, 120].map((time) => (
                <button
                  key={time}
                  className={selectedTime === time ? "active" : ""}
                  onClick={() => setSelectedTime(time)}
                  disabled={startTime !== null}
                >
                  {time}s
                </button>
              ))}
            </div>
            <div className="option-group">
              <span>Sentences:</span>
              {[1, 3, 5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  className={selectedSentences === count ? "active" : ""}
                  onClick={() => setSelectedSentences(count)}
                  disabled={startTime !== null}
                >
                  {count}
                </button>
              ))}
            </div>
            <div className="language-options">
              <span>Language:</span>
              {["python", "javascript", "java", "csharp", "cpp", "php", "typescript", "swift", "go", "kotlin", "mixed"].map((lang) => (
                <button
                  key={lang}
                  className={language === lang ? "active" : ""}
                  onClick={() => setLanguage(lang)}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="reset-button" onClick={resetTest}>
          Reset (Ctrl+R)
        </button>
      </div>

      {showResults && (
        <div className="results-modal">
          <div className="modal-content">
            <h2>Test Results</h2>
            <p>WPM: {wpm}</p>
            <p>Accuracy: {calculateAccuracy()}%</p>
            <p>Time: {elapsedTime}s</p>
            <p>Mistakes: {mistakes}</p>
            <button onClick={resetTest}>Try Again</button>
          </div>
        </div>
      )}
      <p className=" footer">made by Zatrudnilov</p>
    </div>
  );
};

export default TypingTest;