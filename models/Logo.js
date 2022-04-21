import mongoose from "mongoose";

const LogoSchema = new mongoose.Schema({
	name: String,
	url: String,
	results: Array,
});

export default mongoose.model("Logo", LogoSchema, "Logos");
