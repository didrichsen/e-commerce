const fs = require("fs");
const crypto = require("crypto");
const util = require("util");

const scrypt = util.promisify(crypto.scrypt);

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
		//attributes === {email:'',password:''}
		//Add random ID to every user
		attributes.id = this.randomId();
		const salt = crypto.randomBytes(8).toString("hex");
		const buf = await scrypt(attributes.password, salt, 64);
		const records = await this.getAll();
		const record = {
			...attributes,
			password: `${buf.toString("hex")}.${salt}`,
		};
		records.push(record);

		await this.writeAll(records);

		return record;
	}

	async comparePasswords(saved, supplied) {
		//saved password from database. 'hashed + salt'
		//Supplied -> Password given to us by user signing in
		//const result =  saved.split('.');
		//const hashed = result[0];
		//const salt = result[1];

		const [hashed, salt] = saved.split("."); //Samme som ovenfor.
		const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

		return hashed === hashedSuppliedBuf.toString("hex");
	}

	async writeAll(records) {
		await fs.promises.writeFile(this.filename, JSON.stringify(records, null, 2));
	}

	randomId() {
		return crypto.randomBytes(4).toString("hex");
	}

	async getOne(id) {
		//Get user back based on Id
		const records = await this.getAll();
		return records.find((record) => record.id === id);
	}

	async delete(id) {
		const records = await this.getAll();
		const filteredRecords = records.filter((record) => record.id !== id);
		await this.writeAll(filteredRecords);
	}

	async update(id, attributes) {
		const records = await this.getAll();
		const record = records.find((record) => record.id === id);

		if (!record) {
			throw new Error(`Record with id ${id} not found`);
		}

		Object.assign(record, attributes);
		await this.writeAll(records);
	}

	async getOneBy(filters) {
		const records = await this.getAll();

		for (let record of records) {
			let found = true;
			//For in since we are iterating through an object. Then we recive every key.
			for (let key in filters) {
				if (record[key] !== filters[key]) {
					found = false;
				}
			}

			if (found) {
				return record;
			}
		}
	}
}

//Code to be available somewhere else inside our project.
module.exports = new UsersRepositories("users.json");
