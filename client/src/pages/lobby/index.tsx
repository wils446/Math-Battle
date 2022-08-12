import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Brand, PageHeader } from "../../components";
import { SocketContext } from "../../context/socket";
import useLocalStorage from "../../hooks/useLocalStorage";
import styles from "../../styles/Lobby.module.css";

const Lobby: NextPage = () => {
    const router = useRouter();
    const [nickname, setNickname] = useLocalStorage("nickname");
    const [nickInput, setNickInput] = useState("");
    const [roomCode] = useLocalStorage("roomCode");

    const copyCode = () => {
        navigator.clipboard.writeText(roomCode);
    };

    const handleNicknameChange = (str: string) => {
        setNickname(str);
    };

    const nickInputOnChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setNickInput(e.target.value);
    };

    const onEnterButtonOnClick = () => {
        if (nickInput === "") handleNicknameChange(nickname);
        else handleNicknameChange(nickInput);

        router.push(`/${roomCode}`);
    };

    const onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") onEnterButtonOnClick();
    };

    useEffect(() => {
        if (roomCode === "") router.push("/");
    }, []);

    return (
        <div className={styles["layout-container"]}>
            <PageHeader title="Math Battle Lobby" />
            <Brand />
            <div className={styles["room-code"]}>
                <span>Room Code : {roomCode}</span>
                <button onClick={copyCode}>copy</button>
            </div>
            <div className={styles.content}>
                <h1>Enter Your Nickname : </h1>
                <input
                    type="text"
                    placeholder={nickname}
                    onKeyDown={onPressEnter}
                    value={nickInput}
                    onChange={nickInputOnChange}
                />
                <br />
                <button onClick={onEnterButtonOnClick}>Enter Room!</button>
            </div>
        </div>
    );
};

export default Lobby;
