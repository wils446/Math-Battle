export type IPlayerConfig = {
    id: string;
    nickname: string;
    ready: boolean;
    score: number;
    host: boolean;
};

export interface IUserJoined {
    nickname: string;
    socketId: string;
    players: IPlayerConfig[];
    host: boolean;
}
