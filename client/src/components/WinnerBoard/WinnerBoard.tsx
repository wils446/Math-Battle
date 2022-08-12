import { useRouter } from "next/router";
import React, { useContext } from "react";
import { SocketContext } from "../../context/socket";
import { IPlayerConfig } from "../../core/interfaces/IGameDTO";
import styles from "./WinnerBoard.module.css";

type WinnerBoardProps = {
    winner: IPlayerConfig;
};

const WinnerBoard: React.FC<WinnerBoardProps> = ({ winner }) => {
    const socket = useContext(SocketContext);
    const router = useRouter();

    const handleLeaveButton = (e: React.MouseEvent<HTMLButtonElement>) => {
        socket.emit("leaveRoom");
        router.push("/");
    };

    return (
        <div>
            <h1 className={styles["title"]}>Winner</h1>
            <h1 className={styles["winner-name"]}>{winner.id === socket.id ? "You" : winner.nickname}</h1>
            <button className={styles["leave-button"]} onClick={handleLeaveButton}>
                Leave
            </button>
        </div>
    );
};

export default WinnerBoard;
