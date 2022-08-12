const getRandomString = (): string => {
    const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 10; i++) {
        result += char.charAt(Math.floor(Math.random() * char.length));
    }

    return result;
};

export default getRandomString;
