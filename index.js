const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send(`
    <div>
        <form method="POST">
            <input name="email" placeholder="Email"></input>
            <input name="password" placeholder="Password"></input>
            <input name="passwordConfirmation" placeholder="Password confirmation"></input>
            <button>Sign up</button>
        </form>
    </div>`);
});

app.post("/", (req, res) => {
	console.log(req.body);
	res.send("Account Created");
});

app.listen(3000, () => {
	console.log("Listening");
});
