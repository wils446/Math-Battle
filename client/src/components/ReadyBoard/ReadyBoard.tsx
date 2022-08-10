import React, { createRef, useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../context/socket";
import { IPlayerConfig } from "../../core/interfaces/IGameDTO";
import styles from "./ReadyBoard.module.css";
import { createPopper } from "@popperjs/core";

type ReadyBoardProps = {
    players: IPlayerConfig[];
    nickname: string;
    host: string;
};

const ReadyBoard: React.FC<ReadyBoardProps> = ({ players, nickname, host }) => {
    const socket = useContext(SocketContext);
    const [toggleButton, setToggleButton] = useState(players.every(({ ready }) => ready));

    const readyButtonHandler = () => {
        socket.emit("ready");
    };

    const startGame = () => {
        socket.emit("startGame");
    };

    useEffect(() => {
        setToggleButton(players.every(({ ready }) => ready));
    }, [players]);

    return (
        <>
            <div className={styles["text"]}>
                <div className={players[0].ready ? styles["ready"] : styles["unready"]}>{players[0].nickname}</div>
                <div> vs </div>
                <div>
                    {players[1] ? (
                        <div className={players[1].ready ? styles["ready"] : styles["unready"]}>
                            {players[1].nickname}
                        </div>
                    ) : (
                        "Waiting for other player..."
                    )}
                </div>
            </div>
            <div>
                <button
                    onClick={readyButtonHandler}
                    className={
                        players.find((p) => p.nickname === nickname)?.ready
                            ? styles["unready-btn"]
                            : styles["ready-btn"]
                    }
                >
                    Ready!
                </button>
                <br />
                {host === socket.id && (
                    <>
                        <button
                            onClick={startGame}
                            className={
                                !toggleButton || !(players.length > 1)
                                    ? styles["start-button-disabled"]
                                    : styles["start-button"]
                            }
                        >
                            Start Game
                        </button>
                    </>
                )}
            </div>
        </>
    );
};

export default ReadyBoard;
