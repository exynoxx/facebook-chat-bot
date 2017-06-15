const fs = require("fs");
//const latex = require('node-latex');
const login = require("facebook-chat-api");

var idmap = {ids:[{id: "0", name: "dummy"}, {id: "1", name: "dummy1"}]};







//TODO: make latex interpreter
//TODO: make equation parser






login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
	api.setOptions({listenEvents: true});
	api.setOptions({selfListen: true});
    api.setOptions({logLevel: "silent"});

    idmap = JSON.parse (fs.readFileSync ('users.json'));

	console.log("success");

    var exists = function (n){
        for (var i = 0; i < idmap.ids.length; i++) {
            if (idmap.ids[i].id == n){
                return idmap.ids[i].name;
            }
        }
        return false;
    }

    var getInfo = function (message) {
        api.getUserInfo(message.senderID, function (err, ret){
            for(var per in ret) {
                idmap.ids.push({id: message.senderID, name: ret[per].name});

                console.log(ret[per].name + ": ");
                console.log("'"+message.body+"'" + "\n\n");

                return ret[per].name;
            }
        });
    }

    var pattern_calc = new RegExp("(\\d+)\\s*(x|\\*|\\+|\\-|\\/)\\s*(\\d+)");
    var pattern_percent = new RegExp("(\\d+)(\\%|\\s*procent)\\s*af\\s*(\\d+)");
    //var pattern_latex = new RegExp("\\$(.*)\\$");
    var pattern_funfact = new RegExp("(funfact:|fact:|fakta:)");
    var pattern_question = new RegExp(".*\\?");
    var pattern_anne = new RegExp("\\W+an\\W*ne\\w*|^an\\W*ne\\w*|a\\s*n\\s*n\\s*e|shulle|schultz|shul|schul|pigen|laust|eriksen|erik\\w+", "i");

    var prevBody;
    var prevIDX;

	api.listen((err, message) => {

        if (message.type === "message") {

            var name = exists(message.senderID);
            if (name != false) {
                console.log(name+":");
                console.log("'"+message.body+"'");
            } else {
                console.log("ID identify problems");
                name = getInfo(message);
            }

            var match = pattern_calc.exec(message.body);
            if (match != null) {

                var num;
                switch (match[2]) {
                    case "x":
                        num = (parseInt(match[1])*parseInt(match[3]));
                        break;
                    case "*":
                        num = (parseInt(match[1])*parseInt(match[3]));
                        break;
                    case "/":
                        num = (parseInt(match[1])/parseInt(match[3]));
                        break;
                    case "+":
                        num = (parseInt(match[1])+parseInt(match[3]));
                        break;
                    case "-":
                        num = (parseInt(match[1])-parseInt(match[3]));
                        break;
                }

                var msg = num;
                api.sendMessage({body: msg}, message.threadID);
                //prevBody = message.body;
            }

            match = pattern_percent.exec(message.body);
            if (match != null) {
                var num = Math.floor((parseInt(match[1])/100)*parseInt(match[3]));
                var msg = num;
                api.sendMessage({body: msg}, message.threadID);
                //prevBody = message.body;
            }

            /*
            match = pattern_latex.exec(message.body);
            if (match != null) {
                var txt = match[1];
                console.log(txt);

                var PDFLatex = require('pdflatex');
                var tex = new PDFLatex("input.tex");
                tex.process();
            }
            */

            match = pattern_funfact.test(message.body) | pattern_anne.test(message.body);
            if (match == true) {
                //0->10 var idx = Math.floor(Math.random() * 11);
                var obj = JSON.parse(fs.readFileSync('funfact.json', 'utf8'));
                var len = obj.funfacts.length;

                var idx = Math.floor(Math.random() * len);
                while (idx == prevIDX) {
                    idx = Math.floor(Math.random() * len);
                }
                var txt = obj.funfacts[idx];
                api.sendMessage(txt, message.threadID);
                prevIDX = idx;
            }


            if (message.body == "/id") {
                api.getUserInfo(message.senderID, function (err, ret){
                    for(var per in ret) {
                        api.sendMessage(JSON.stringify (ret[per]), message.threadID);
                    }
                });

            }
            /*} else {
                console.log("MAGNUS!!");
            }*/

		}
    	//console.log(message.body + " :: " + message.senderID + " : " + message.threadID);
    });
});
