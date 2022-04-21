import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import { ObjectId } from "mongodb";
import cors from "cors";
import Logo from "./models/Logo.js";
import User from "./models/User.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
const port = 5000;
const test = mongoose.connect(process.env.CONNECTION_URI);
const db = mongoose.connection;
db.once("open", () => console.log("Connected to the databse"));
app.use(cors());
// main().catch(console.error);
app.get("/", (req, res) => {
	console.log("visited");
	res.send("Hello");
});

app.get("/logos", async (req, res) => {
	try {
		const logos = await Logo.find();
		res.cookie("logos", "yo").send(logos);
	} catch (err) {
		res.status(500).send("Couldn't get logos");
	}
});
let user = [];
app.get("/setcookie", (req, res) => {
	res.cookie(`Cookie token name`, `encrypted cookie string Value`);
	res.send("Cookie have been saved successfully");
});

app.get("/users", async (req, res) => {
	const users = await User.find();
	res.send(users);
});
app.post("/users/:id", async (req, res) => {
	const {
		mascot,
		correctAnswers: newCorrectAnswers,
		totalQuestions: newTotalQuestions,
	} = req.body;
	const { id } = req.params;
	if (id.length !== 24) {
		res.status(404).send("Error user Not Found");
		return;
	}
	const objectId = new ObjectId(id);

	const user = await User.findOne({ _id: objectId });
	const results = user.results;
	const takenQuiz = results.find((result) => result.mascot === mascot);
	if (!takenQuiz) {
		results.push({ ...req.body, date: new Date().getTime().toString() });
	} else {
		const { correctAnswers, totalQuestions } = takenQuiz;
		const percent = correctAnswers / totalQuestions;
		const newPercent = newCorrectAnswers / newTotalQuestions;
		if (percent < newPercent) {
			const index = results.indexOf(takenQuiz);
			results.splice(index, 1);
			results.push({ ...req.body, date: new Date().getTime().toString() });
		}
	}

	if (user) {
		user.save((err) => {
			if (err) {
				res.send("result can't be posted");
			}
		});
		return res.send(user);
	}
	res.status(404).send("User not found");
});

app.get("/users/:id", async (req, res) => {
	const { id } = req.params;
	if (id.length !== 24) {
		res.status(404).send("Error user Not Found");
		return;
	}
	const objectId = new ObjectId(id);

	const user = await User.findOne({ _id: objectId });

	// res.send("posting to results");
	if (user) return res.send(user);

	res.status(404).send("User not found");
});
app.post("/users", async (req, res) => {
	const { username, password } = req.body;
	const existingUser = await User.findOne({ username: username });

	if (existingUser) {
		res.send({
			body: {
				error: true,
				message: `The username ${username} is already taken`,
			},
		});

		return;
	} else {
		const hashedPassword = bcrypt.hashSync(password, 10);
		const user = new User({ username: username, password: hashedPassword });

		user.save((err) => {
			if (err) {
				res.send({
					body: {
						error: true,
						message: "There was an error",
					},
				});
			} else {
				console.log(user);
				res.send({
					body: {
						error: false,
						message: `Account successfuly created`,
					},
				});
			}
		});
	}

	// console.log(existingUser);
	// console.log(req.body);
	// console.log("Post received");
	// res.send(null);
});
app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username: username });
	if (user && password === user.password) {
		res.send({
			body: {
				error: false,
				message: "Successfuly logged in",
				id: user["_id"],
			},
		});
	} else {
		res.send({
			body: {
				error: true,
				message: "Username or password is not correct",
			},
		});
	}
});

// }

async function findCollection(client, listing) {
	client.db("NBA-2018-stats").collection("Logos").findOne();
}

app.listen(port, () => {
	console.log(`Server running on port: http://localhost:${port}`);
});
