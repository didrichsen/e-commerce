const express = require("express");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const { check, validationResult } = require("express-validator");

const router = express.Router();

router.get("/signup", (req, res) => {
	res.send(signupTemplate({ req }));
});

router.post(
	"/signup",
	[
		check("email").trim().normalizeEmail().isEmail(),
		check("password").trim().isLength({ min: 4, max: 20 }),
		check("passwordConfirmation").trim().isLength({ min: 4, max: 20 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		console.log(errors);
		const { email, password, passwordConfirmation } = req.body;
		const existingUser = await usersRepo.getOneBy({ email });
		if (existingUser) {
			return res.send("Email in use");
		}

		if (password !== passwordConfirmation) {
			return res.send("Password must match");
		}

		//Create user within the users repo
		const user = await usersRepo.create({ email, password });

		console.log(user.id);

		// Store the id of the user inside a coockie. Using a package from a third party (npm install cookie-session)

		req.session.userId = user.id;

		res.send("Account Created");
	},
);

router.get("/signout", (req, res) => {
	req.session = null;
	res.send("You are logged out");
});

router.get("/signin", (req, res) => {
	res.send(signinTemplate());
});

router.post("/signin", async (req, res) => {
	const { email, password } = req.body;
	const user = await usersRepo.getOneBy({ email });

	if (!user) {
		return res.send("Email not found");
	}

	const validPassword = await usersRepo.comparePasswords(user.password, password);

	if (!validPassword) {
		return res.send("Invalid password");
	}

	req.session.userId = user.id;

	res.send("You are signed in!");
});

module.exports = router;
