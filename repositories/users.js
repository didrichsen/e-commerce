const fs = require("fs");
const crypto = require("crypto");

class UsersRepositories {
	constructor(filename) {
		if (!filename) {
			//error if there is no filename
			throw new Error("Creating a repository requires a filename");
		}

		this.filename = filename;
		try {
			//if excits
			fs.accessSync(this.filename);
		} catch (err) {
			//if not excits
			fs.writeFileSync(this.filename, "[]");
		}
	}

	async getAll() {
		//Gives us an array of all the users registrered in the file
		return JSON.parse(await fs.promises.readFile(this.filename, { encoding: "utf-8" }));
	}

	async create(attributes) {
		//Add random ID to every user
		attributes.id = this.randomId();
		const records = await this.getAll();
		records.push(attributes);

		await this.writeAll(records);
	}

	async writeAll(records) {
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
	}

	randomId() {
		return crypto.randomBytes(4).toString("hex");
	}
}

const test = async () => {
	const repo = new UsersRepositories("users.json");

	repo.create({ email: "test@test.com", password: "password" });
	const users = await repo.getAll();

	console.log(users);
};

test();
