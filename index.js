const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const usersRepo = require("./repositories/users");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cookieSession({
		keys: ["3245432fefscbteryhrfdry"],
	}),
);

app.get("/", (req, res) => {
	res.send(`
    <div>
		Your id is: ${req.session.userId}
        <form method="POST">
            <input name="email" placeholder="Email"></input>
            <input name="password" placeholder="Password"></input>
            <input name="passwordConfirmation" placeholder="Password confirmation"></input>
            <button>Sign up</button>
        </form>
    </div>`);
});

app.post("/", async (req, res) => {
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
});

app.listen(3000, () => {
	console.log("Listening");
});
