var mercury = require("mercury")
var h = mercury.h
var crossroads = require("crossroads")

var clicks = mercury.input()
var clickCount = mercury.value(0)

clicks(function () {
    clickCount.set(clickCount() + 1)
})
crossroads.addRoute('/news/{id}', function(id){
  clickCount.set(id);
});
//will match '/news/{id}' route passing 123 as param
crossroads.parse('/news/123');

function render(clickCount) {
    return h("div.counter", [
        "The state ", h("code", "clickCount"),
        " has value: " + clickCount + ".", h("input.button", {
            type: "button",
            value: "Click me!",
            "ev-click": mercury.event(clicks)
        })
    ])
}

mercury.app(document.body, clickCount, render)
