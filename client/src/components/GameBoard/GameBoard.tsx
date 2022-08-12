import { useContext, useState } from "react";
import { SocketContext } from "../../context/socket";
import { IPlayerConfig } from "../../core/interfaces/IGameDTO";
import useLocalStorage from "../../hooks/useLocalStorage";
import styles from "./GameBoard.module.css";

type GameBoardProps = {
    questions: string[];
    players: IPlayerConfig[];
};

const GameBoard: React.FC<GameBoardProps> = ({ questions, players }) => {
    const socket = useContext(SocketContext);
    const [nickname] = useLocalStorage("nickname");
    const [answerInput, setAnswerInput] = useState<string>("");
    const [numOfQuestion, setNumOfQuestion] = useState<number>(0);
    const [wrongAnswer, setWrongAnswer] = useState(false);

    const handleAnswerInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnswerInput(e.target.value);
        setWrongAnswer(false);

        const currentAnswer = eval(questions[numOfQuestion]);
        if (e.target.value === "" + eval(questions[numOfQuestion])) return nextQuestion();
        if (e.target.value.length >= ("" + currentAnswer).length) setWrongAnswer(true);
    };

    const questionTimeout = () => {
        setNumOfQuestion(numOfQuestion + 1);
        setAnswerInput("");
    };

    const nextQuestion = () => {
        setAnswerInput("");
        setNumOfQuestion(numOfQuestion + 1);
        if (numOfQuestion === questions.length - 1) finish();
        socket.emit("updateScore");
    };

    const finish = () => {
        socket.emit("finishGame");
    };

    return (
        <div className={styles["box"]}>
            <div className={styles["score"]}>
                {players.map((player) => {
                    return (
                        <div key={player.id} className={styles["score-text"]}>
                            {player.id === socket.id ? "You" : player.nickname} : {player.score}/15
                        </div>
                    );
                })}
            </div>
            <h1 className={styles["question"]}>{questions[numOfQuestion]}</h1>
            <input
                type="text"
                className={wrongAnswer ? styles["answer-wrong"] : styles["answer-input"]}
                onChange={handleAnswerInput}
                value={answerInput}
            />
            {wrongAnswer && <h1 className={styles["wrong-text"]}>Wrong!</h1>}
        </div>
    );
};

export default GameBoard;
