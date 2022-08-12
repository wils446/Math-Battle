import { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";
import { IPlayerConfig, IUserJoined } from "../interfaces/IGameDTO";

type GameConfig = {
    setPlayers: Dispatch<SetStateAction<IPlayerConfig[]>>;
    setPlaying: Dispatch<SetStateAction<boolean>>;
    setHost: Dispatch<SetStateAction<string>>;
    setQuestions: Dispatch<SetStateAction<string[]>>;
    setWinner: Dispatch<SetStateAction<IPlayerConfig | undefined>>;
};

class Game {
    /**
     * constructor
     * @param {Socket} socket
     * @param {string} nickname
     * @param {string} roomId
     * @param {GameConfig} gameConfig
     */
    constructor(
        private socket: Socket,
        private nickname: string,
        private roomId: string,
        private gameConfig: GameConfig
    ) {}

    /**
     * initialize socket
     * @returns {() => void}
     */
    public socketInitialize() {
        const { setHost, setPlayers, setPlaying, setQuestions, setWinner } = this.gameConfig;

        this.socket.emit("joinRoom", { roomId: this.roomId, nickname: this.nickname });

        this.socket.on("userJoined", (data: IUserJoined) => {
            setPlayers([...data.players]);
            if (data.host) setHost(data.socketId);
        });

        this.socket.on("userReady", (data: Omit<IUserJoined, "nickname">) => {
            console.log(1);
            setPlayers([...data.players]);
        });

        this.socket.on("startGame", (data: { question: string[] }) => {
            setQuestions(data.question);
            setPlaying(true);
        });

        this.socket.on("updateScore", (data: { players: IPlayerConfig[] }) => {
            setPlayers([...data.players]);
        });

        this.socket.on("startGame", (data: { questions: string[] }) => {
            setQuestions(data.questions);
            setPlaying(true);
        });

        this.socket.on("userLeft", (data: { players: IPlayerConfig[] }) => {
            setPlayers([...data.players]);
        });

        this.socket.on("finishGame", (data: { winner: IPlayerConfig }) => {
            setWinner(data.winner);
            setPlaying(false);
        });

        /*
        this.socket.on("fullRoom", ({ userId }) => {
            if (userId !== socket.id) return;
            alert("Room is full");
            router.push("/");
        });*/

        return () => {
            this.socket.emit("leaveRoom", { roomId: this.roomId });
        };
    }
}

export default Game;
