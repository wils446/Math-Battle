import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEventHandler, useState } from "react";
import { Brand, PageHeader } from "../components";
import useLocalStorage from "../hooks/useLocalStorage";
import styles from "../styles/Home.module.css";
import getRandomString from "../utils/getRandomString";

const Home: NextPage = () => {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState("");
    const [code, setCode] = useLocalStorage("roomCode");

    const roomCodeInputOnChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        //max input length is 10
        if (event.target.value.length > 10) return;
        setRoomCode(event.target.value);
    };

    const joinRoom = () => {
        setCode(roomCode);
        router.push("/lobby");
    };
    const createRoom = () => {
        const roomCode = getRandomString();
        setCode(roomCode);
        router.push("/lobby");
    };

    const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") joinRoom();
    };

    return (
        <>
            <PageHeader title="Battle Math!" />
            <div className={styles["layout-container"]}>
                <Brand />
                <div className={styles.content}>
                    <h1>Enter Room Code : </h1>
                    <input type="text" onChange={roomCodeInputOnChange} onKeyDown={onPressEnter} value={roomCode} />
                    <br />
                    <button onClick={joinRoom}>Join Room</button>
                    <br />
                    <button onClick={createRoom}>Create Room</button>
                </div>
            </div>
        </>
    );
};

export default Home;
