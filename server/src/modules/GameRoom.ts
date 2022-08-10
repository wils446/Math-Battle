import { Server, Socket } from "socket.io";

type IPlayerConfig = {
	id: string;
	nickname: string;
	ready: boolean;
	score: number;
	host: boolean;
};

class GameRoom {
	private players: Map<string, IPlayerConfig>;
	private isPlaying: boolean;
	private questions: string[] = [];

	/**
	 * GameRoom constructor
	 * @param {Socket} io
	 * @param {string} roomId
	 * @param {string} hostNickname
	 */
	constructor(private io: Server, private roomId: string, private hostSocketId: string) {
		this.players = new Map<string, IPlayerConfig>();

		this.isPlaying = false;
	}

	/**
	 * add player to the room
	 * @param {Socket} user
	 * @param {string} nickname
	 * @returns {Promise<void>}
	 */
	public async addPlayer(user: Socket, nickname: string): Promise<void> {
		user.join(this.roomId);

		if (this.players.size === 2) {
			this.customErrorHandler("fullRoom", user.id);
			user.leave(this.roomId);
			return;
		}

		await this.players.set(user.id, {
			id: user.id,
			nickname,
			ready: false,
			score: 0,
			host: this.hostSocketId === nickname ? true : false,
		});
		this.io.to(this.roomId).emit("userJoined", {
			nickname,
			socketId: user.id,
			players: Array.from(this.players.values()),
			host: this.hostSocketId === user.id ? true : false,
		});
		console.log(user.id + " joined room " + this.roomId);
	}

	/**
	 * user left the room
	 * @param {Socket} user
	 * @returns {void}
	 */
	public playerLeft(user: Socket): void {
		this.players.delete(user.id);
		user.leave(this.roomId);
		this.io.to(this.roomId).emit("userLeft", user.id);
		this.finishGame(true);
	}

	/**
	 * set user ready
	 * @param {Socket} user
	 * @returns {void}
	 */
	public setUserReady(user: Socket): void {
		const player = this.players.get(user.id);
		player!.ready = !player?.ready;
		this.io.to(this.roomId).emit("userReady", {
			socketId: user.id,
			players: Array.from(this.players.values()),
		});
	}

	/**
	 * update player score
	 * @param {Socket} user
	 * @returns {void}
	 */
	public updateScore(user: Socket): void {
		const player = this.players.get(user.id);
		player!.score++;
		this.io.to(this.roomId).emit("updateScore", {
			players: Array.from(this.players.values()),
		});
	}

	/**
	 * start game
	 * @returns {void}
	 */
	public startGame(): void {
		if (!this.getAllUserReady()) return;
		this.generateQuestions();
		this.isPlaying = true;
		this.io.to(this.roomId).emit("startGame", { questions: this.questions });
	}

	/**
	 * finish game
	 * @param {boolean} isPlayerLeft
	 * @returns {void}
	 */
	public finishGame(isPlayerLeft = false): void {
		let winner;
		if (isPlayerLeft) {
			winner = Array.from(this.players.values())[0].id;
		} else {
			winner = Array.from(this.players.values())
				.sort((a, b) => b.score - a.score)
				.shift()!.id;
		}

		this.isPlaying = false;
		this.io.to(this.roomId).emit("finishGame", winner);
	}

	/**
	 * get the room id
	 * @returns {string}
	 */
	public getRoomId(): string {
		return this.roomId;
	}

	/**
	 * get all players final score
	 * @returns {{id : string, score : number}[]}
	 */
	private getFinalScore() {
		return Array.from(this.players.values()).map((player) => {
			return { id: player.id, score: player.score };
		});
	}

	/**
	 * get all players ready
	 * @returns {boolean}
	 */
	private getAllUserReady(): boolean {
		return Array.from(this.players.values()).every((player) => player.ready);
	}

	/**
	 * get all players nickname
	 * @returns {string[]}
	 */
	private getAllPlayersNickname(): string[] {
		return Array.from(this.players.values()).map((player) => player.nickname);
	}

	/**
	 * generate all question
	 * @returns {void}
	 */
	private generateQuestions(): void {
		for (let i = 0; i < 15; i++) {
			if (i < 5) this.questions.push(this.generateQuestion(100, ["+", "-"]));
			else if (i < 10) this.questions.push(this.generateQuestion(10, ["*", "/"]));
			else this.questions.push(this.generateQuestion(100, ["*", "/", "+", "-"]));
		}
	}

	/**
	 * generate a question
	 * @param {number} max
	 * @param {string[]} operator
	 * @returns {string}
	 */
	private generateQuestion(max: number, operator: string[]): string {
		return `${this.randomNumber(max)} ${this.getRandomOperator(...operator)} ${this.randomNumber(
			max
		)}`;
	}

	/**
	 * generate a random number
	 * @param {number} max
	 * @returns {number}
	 */
	private randomNumber(max: number): number {
		return Math.floor(Math.random() * max);
	}

	/**
	 * randomize an operator
	 * @param {string[]} operator
	 * @returns {string}
	 */
	private getRandomOperator(...operator: string[]): string {
		return operator[Math.floor(Math.random() * operator.length)];
	}

	private customErrorHandler(str: string, userId: string): void {
		this.io.to(this.roomId).emit(str, { userId });
	}
}

export default GameRoom;
