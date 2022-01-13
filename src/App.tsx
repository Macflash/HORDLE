import React from "react";
import logo from "./logo.svg";
import "./App.css";

import { tons_of_words } from "./dictionary";
import { common_words } from "./20k";

function wordify(dictionary: string) {
  return dictionary
    .split("\n")
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length === 5);
}

const common_wordles = wordify(common_words);
const all_valid_wordle_guesses = wordify(tons_of_words);

function letter(c: number) {
  const offset = "a".charCodeAt(0);
  return String.fromCharCode(c + offset);
}

type LetterResult = "NotGuessed" | "WrongLetter" | "WrongLocation" | "Correct";

interface GuessResult {
  guess: string;
  result: LetterResult[];
}

function getDeadLetters(grs: GuessResult[]) {
  let deadLetters = new Set<string>();
  for (const gr of grs) {
    gr.result.forEach((result, index) => {
      if (result === "WrongLetter") {
        deadLetters.add(gr.guess[index]);
      }
    });
  }
  return deadLetters;
}

function getYellowLetters(grs: GuessResult[]) {
  let letters = new Set<string>();
  for (const gr of grs) {
    gr.result.forEach((result, index) => {
      if (result === "WrongLocation") {
        letters.add(gr.guess[index]);
      }
    });
  }
  return letters;
}

function getGreenLetters(grs: GuessResult[]) {
  let letters = new Set<string>();
  for (const gr of grs) {
    gr.result.forEach((result, index) => {
      if (result === "Correct") {
        letters.add(gr.guess[index]);
      }
    });
  }
  return letters;
}

function getLetters(word: string) {
  let letters = new Set<string>();
  for (let i = 0; i < word.length; i++) {
    letters.add(word[i]);
  }
  return letters;
}

function CreateGuessResult(guess: string, word: string): GuessResult {
  const letters = getLetters(word);

  const result: LetterResult[] = [];
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] == word[i]) {
      result.push("Correct");
    } else if (letters.has(guess[i])) {
      result.push("WrongLocation");
    } else {
      result.push("WrongLetter");
    }
  }

  return { guess, result };
}

function GuessResultRow({
  gr,
  onChange,
}: {
  onChange: (newGr: GuessResult) => void;
  gr: GuessResult;
}) {
  const { guess, result } = gr;
  return (
    <div style={{ display: "flex", flexShrink: 1 }}>
      {result.map((r, index) => {
        let color: string | undefined = undefined;
        let border = DARK_GREY;
        if (r === "Correct") {
          color = border = GREEN;
        }
        if (r === "WrongLocation") {
          color = border = YELLOW;
        }
        if (r === "WrongLetter") {
          color = border = DARK_GREY;
        }
        return (
          <div
            style={{
              height: 60,
              width: 60,
              display: "flex",
              justifyContent: "center",
              flexShrink: 1,
              alignItems: "center",
              textAlign: "center",
              margin: 2,
              border: `2px solid ${border}`,
              background: color,
              fontWeight: "bold",
              fontSize: 32,
              flex: "auto",
            }}
            onClick={() => {
              if (r == "Correct") {
                let newResult = [...result];
                newResult[index] = "WrongLetter";
                onChange({ guess, result: newResult });
              } else if (r == "WrongLetter") {
                let newResult = [...result];
                newResult[index] = "WrongLocation";
                onChange({ guess, result: newResult });
              } else if (r == "WrongLocation") {
                let newResult = [...result];
                newResult[index] = "Correct";
                onChange({ guess, result: newResult });
              }
            }}>
            {guess[index]?.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}

const WHITE = "rgb(215, 218, 220)";
const YELLOW = "rgb(181, 159, 59)";
const GREEN = "rgb(83, 141, 78)";
const DARK_GREY = "rgb(58, 58, 60)";
const LIGHT_GREY = "rgb(129, 131, 132)";

const keys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["ENTER", "z", "x", "c", "v", "b", "n", "m", "DELETE"],
];

function Keyboard({
  guesses,
  onKey,
}: {
  guesses: GuessResult[];
  onKey: (key: string) => void;
}) {
  const deadLetters = getDeadLetters(guesses);
  const yellowLetters = getYellowLetters(guesses);
  const greenLetters = getGreenLetters(guesses);

  return (
    <div>
      {keys.map((row, rowKey) => (
        <div key={rowKey} style={{ display: "flex", justifyContent: "center" }}>
          {row.map((key) => {
            let color = LIGHT_GREY;
            if (deadLetters.has(key)) color = DARK_GREY;
            if (yellowLetters.has(key)) color = YELLOW;
            if (greenLetters.has(key)) color = GREEN;

            const isSpecialKey = key == "ENTER" || key == "DELETE";
            let extras: React.CSSProperties = {};
            if (isSpecialKey) {
              extras = {
                flex: "auto",
                justifyContent: "center",
                textAlign: "center",
                alignItems: "center",
                display: "flex",
                padding: 0,
                maxWidth: 80,
              };
            }
            return (
              <div
                onClick={() => onKey(key)}
                key={key}
                style={{
                  background: color,
                  margin: 6,
                  padding: "20px 5px",
                  borderRadius: 4,
                  fontWeight: "bold",
                  cursor: "pointer",
                  maxWidth: 25,
                  flex: "auto",
                  justifyContent: "center",
                  textAlign: "center",
                  alignItems: "center",
                  display: "flex",
                  ...extras,
                }}>
                {key.toUpperCase()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const EmptyResult: LetterResult[] = [
  "NotGuessed",
  "NotGuessed",
  "NotGuessed",
  "NotGuessed",
  "NotGuessed",
];

const EmptyGuess: GuessResult = {
  guess: "",
  result: EmptyResult,
};

function App() {
  const word = "hodor";

  const [hasWon, setHasWon] = React.useState(false);
  const [hasLostBefore, setHasLostBefore] = React.useState(false);
  const [currentGuessIndex, setCurrentGuessIndex] = React.useState(0);

  const [guesses, setGuesses] = React.useState<GuessResult[]>([
    EmptyGuess,
    EmptyGuess,
    EmptyGuess,
    EmptyGuess,
    EmptyGuess,
    EmptyGuess,
  ]);

  const hasLost = currentGuessIndex >= guesses.length;
  if (hasLost) {
    if (!hasLostBefore) {
      setHasLostBefore(true);
      alert("You lost loser!");
    }
  }
  const currentGuess = guesses[currentGuessIndex]?.guess;

  function updateCurrentGuess(newGuess: string, result?: LetterResult[]) {
    if (hasWon || hasLost) return;
    if (result) setCurrentGuessIndex(currentGuessIndex + 1);
    if (!result) result = EmptyResult;
    const newGuesses = [...guesses];
    newGuesses[currentGuessIndex] = { guess: newGuess, result };
    setGuesses(newGuesses);
  }

  return (
    <div
      className='App'
      style={{
        background: "black",
        color: WHITE,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}>
      <div
        style={{
          fontWeight: "bold",
          fontSize: 36,
          borderBottom: `1px solid ${DARK_GREY}`,
          marginBottom: 2,
          fontKerning: "auto",
        }}>
        <a
          style={{ color: WHITE, textDecoration: "none" }}
          href='https://github.com/Macflash/HORDLE'>
          HORDLE
        </a>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: "auto",
          justifyContent: "center",
        }}>
        {guesses.map((gr, index) => (
          <GuessResultRow
            gr={gr}
            onChange={(newGr) => {
              let newGuesses = [...guesses];
              newGuesses[index] = newGr;
              setGuesses(newGuesses);
            }}
          />
        ))}
      </div>

      <Keyboard
        guesses={guesses}
        onKey={(key) => {
          switch (key) {
            case "ENTER":
              if (currentGuess.length == 5) {
                if (currentGuess === word) {
                  setHasWon(true);
                  setTimeout(() => alert("You won!"), 100);
                } else if (!all_valid_wordle_guesses.includes(currentGuess)) {
                  alert(
                    currentGuess.toUpperCase() +
                      " was not found in our dictionary."
                  );
                  updateCurrentGuess("");
                  return;
                }
                const { guess, result } = CreateGuessResult(
                  currentGuess.toLowerCase(),
                  word
                );
                updateCurrentGuess(guess, result);
              }
              break;
            case "DELETE":
              if (currentGuess.length > 0) {
                updateCurrentGuess(
                  currentGuess.substring(0, currentGuess.length - 1)
                );
              }
              break;
            default:
              if (currentGuess.length < 5) {
                updateCurrentGuess(currentGuess + key);
              }
          }
        }}
      />
    </div>
  );
}

export default App;
