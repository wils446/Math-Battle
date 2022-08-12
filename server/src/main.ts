import { Server } from "socket.io";
import GameRoom from "./modules/GameRoom";

const io = new Server({
	cors: {
		origin: "*",
	},
});

const rooms = new Map<string, GameRoom>();
const users = new Map<string, GameRoom>();

const getUserRoom = (userId: string): GameRoom | undefined => {
	const user = users.get(userId);
	if (!user) return;

	const room = rooms.get(user.getRoomId());
	if (!room) return;

	return room;
};

io.on("connection", (socket) => {
	const time = new Date().toLocaleTimeString();
	console.log(time + " user connected : " + socket.id);

	socket.on("joinRoom", async ({ roomId, nickname }: { roomId: string; nickname: string }) => {
		let room = rooms.get(roomId);
		if (!room) {
			rooms.set(roomId, new GameRoom(io, roomId, socket.id));
			room = rooms.get(roomId);
		}
		users.set(socket.id, room as GameRoom);

		await room?.addPlayer(socket, nickname);
	});

	socket.on("ready", () => {
		const room = getUserRoom(socket.id);
		if (!room) return;

		room.setUserReady(socket);
	});

	socket.on("startGame", () => {
		const room = getUserRoom(socket.id);
		if (!room) return;

		room.startGame();
	});

	socket.on("updateScore", () => {
		const room = getUserRoom(socket.id);
		if (!room) return;

		room.updateScore(socket);
	});

	socket.on("finishGame", () => {
		const room = getUserRoom(socket.id);
		if (!room) return;

		room.finishGame();
	});

	socket.on("leaveRoom", () => {
		const room = getUserRoom(socket.id);
		if (!room) return;

		room.playerLeft(socket);
		if (room.getPlayersAmount() === 0) rooms.delete(room.getRoomId());
		console.log(rooms.size);
	});

	socket.on("disconnect", () => {
		const time = new Date().toLocaleTimeString();
		console.log(time + " user disconnected : " + socket.id);
		const room = getUserRoom(socket.id);
		if (!room) return;

		room.playerLeft(socket);
		if (room.getPlayersAmount() === 0) rooms.delete(room.getRoomId());
	});

	socket.on("checkRoomExistsOrFull", ({ roomId }: { roomId: string }) => {
		const room = rooms.get(roomId);
		if (!room) {
			socket.emit("roomExistsOrFull", { exists: false, full: false });
			return;
		}

		if (room.getPlayersAmount() === 2) {
			socket.emit("roomExistsOrFull", { exists: true, full: true });
			return;
		}

		socket.emit("roomExistsOrFull", { exists: true, full: false });
	});
});

io.listen(3001);
