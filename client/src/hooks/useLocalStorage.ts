import { Dispatch, SetStateAction, useEffect, useState } from "react";

const getStorageValue = (key: string) => {
    return localStorage.getItem(key) || "";
};

const useLocalStorage = (key: string): [string, Dispatch<SetStateAction<string>>] => {
    if (typeof window === "undefined") return ["", () => {}];
    const [value, setValue] = useState(() => getStorageValue(key));

    useEffect(() => {
        localStorage.setItem(key, value);
    }, [value]);

    return [value, setValue];
};

export default useLocalStorage;
