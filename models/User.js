import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	results: Array,
});

export default mongoose.model("User", UserSchema, "Users");
