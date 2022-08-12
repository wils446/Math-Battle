import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEventHandler, useContext, useEffect, useState } from "react";
import { Brand, PageHeader } from "../components";
import { SocketContext } from "../context/socket";
import useLocalStorage from "../hooks/useLocalStorage";
import styles from "../styles/Home.module.css";
import getRandomString from "../utils/getRandomString";

const Home: NextPage = () => {
    const socket = useContext(SocketContext);
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    const [code, setCode] = useLocalStorage("roomCode");
    const [roomAvailable, setRoomAvailable] = useState(false);

    //handle room code change
    const roomCodeInputOnChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        //max input length is 10
        if (event.target.value.length > 10) return;
        setRoomCode(event.target.value);
    };

    //join room
    const joinRoom = () => {
        setCode(roomCode);
        socket.emit("checkRoomExistsOrFull", { roomId: roomCode });
        if (roomAvailable) router.push("/lobby");
    };

    //create room
    const createRoom = () => {
        const roomCode = getRandomString();
        setCode(roomCode);
        router.push("/lobby");
    };

    //handle room code input enter
    const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") joinRoom();
    };

    //check if room code is available
    const checkRoomExistsOrFull = () => {
        socket.on("roomExistsOrFull", ({ exists, full }: { exists: Boolean; full: Boolean }) => {
            if (!exists) {
                alert("Room does not exist");
                router.push("/");
            } else if (full) {
                alert("Room is full");
                router.push("/");
            } else {
                setRoomAvailable(true);
            }
        });
    };

    useEffect(checkRoomExistsOrFull, []);

    return (
        <>
            <PageHeader title="Battle Math!" />
            <div className={styles["layout-container"]}>
                <Brand />
                <div className={styles.content}>
                    <h1>Enter Room Code : </h1>
                    <input type="text" onChange={roomCodeInputOnChange} onKeyDown={onPressEnter} value={roomCode} />
                    <br />
                    <button
                        className={roomCode.length < 10 ? styles["button-disabled"] : ""}
                        disabled={roomCode.length < 0}
                        onClick={joinRoom}
                    >
                        Join Room
                    </button>
                    <br />
                    <button onClick={createRoom}>Create Room</button>
                </div>
            </div>
        </>
    );
};

export default Home;
