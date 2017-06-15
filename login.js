const fs = require("fs");
const login = require("facebook-chat-api");

var idmap = {ids:[{id: "0", name: "dummy"}, {id: "1", name: "dummy1"}]};

login({email: "FB-USERNAME", password: "FB-PASSWORD"}, (err, api) => {
    if(err) return console.error(err);

    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

	api.getFriendsList((err, data) => {
        if(err) return console.error(err);

		for (var i = 0; i < data.length; i++) {
			idmap.ids.push({id: data[i].userID, name: data[i].fullName});
		}

        console.log(data.length);
		console.log(idmap.ids);

		fs.writeFileSync('users.json', JSON.stringify(idmap));
    });
});
