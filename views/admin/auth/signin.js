const layout = require("../layout");

module.exports = () => {
	return layout({
		content: `
			<div>
				<form method="POST">
					<input name="email" placeholder="Email"></input>
					<input name="password" placeholder="Password"></input>
					<button>Sign In</button>
				</form>
			</div>
		`,
	});
};
