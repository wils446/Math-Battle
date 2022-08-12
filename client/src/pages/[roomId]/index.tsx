import { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { Brand, PageHeader, ReadyBoard } from "../../components";
import GameBoard from "../../components/GameBoard";
import WinnerBoard from "../../components/WinnerBoard";
import { socket as socketCtx, SocketContext } from "../../context/socket";
import { IPlayerConfig } from "../../core/interfaces/IGameDTO";
import Game from "../../core/modules/Game";
import useLocalStorage from "../../hooks/useLocalStorage";
import styles from "../../styles/Game.module.css";

type PageProps = {
    roomId: string;
};

export const getServerSideProps = async (context: NextPageContext) => {
    const { roomId } = context.query;
    return {
        props: { roomId },
    };
};

const GamePage: NextPage<PageProps> = ({ roomId }) => {
    const socket = useContext(SocketContext);
    const router = useRouter();
    const [roomCode, setRoomCode] = useLocalStorage("roomCode");
    const [nickname] = useLocalStorage("nickname");

    //game config
    const startButtonElement = useRef<HTMLButtonElement>(null);
    const [players, setPlayers] = useState<IPlayerConfig[]>([]);
    const [isPlaying, setPlaying] = useState<boolean>(false);
    const [host, setHost] = useState<string>("");
    const [questions, setQuestions] = useState<string[]>([]);
    const [winner, setWinner] = useState<IPlayerConfig>();

    //copy room code
    const copyCode = () => {
        navigator.clipboard.writeText(roomId);
    };

    //init game
    const socketInitialize = () => {
        const game = new Game(socket, nickname, roomId, {
            setHost,
            setPlayers,
            setPlaying,
            setQuestions,
            setWinner,
        });
        return game.socketInitialize();
    };

    //to reject player joining with link
    const rejectJoinWithLink = () => {
        if (roomId !== roomCode) router.push("/");
        setRoomCode("");
    };

    useEffect(rejectJoinWithLink, []);
    useEffect(socketInitialize, []);

    return (
        <SocketContext.Provider value={socketCtx}>
            <div className={styles["layout-container"]}>
                <PageHeader title="Battle Math!" />
                <Brand />
                <div className={styles["room-code"]}>
                    <span>Room Code : {roomId}</span>
                    <button onClick={copyCode}>copy</button>
                </div>
                {!isPlaying && winner === undefined && players.length > 0 && (
                    <ReadyBoard players={players} nickname={nickname} host={host} />
                )}
                {isPlaying && <GameBoard questions={questions} players={players} />}
                {!isPlaying && winner !== undefined && <WinnerBoard winner={winner} />}
            </div>
        </SocketContext.Provider>
    );
};

export default GamePage;
