
Touchpad = {
    who: "Touchpad",
    id: "Touchpad",
    buttons: [],
    axes: [],
    connected: false,
}

Touchpad.registerButtons = function(){
    for (var i = 0; i < 16; i++) {
        this.buttons[i] = new TouchButton({ index: i })
    }
}

Touchpad.registerAxes = function(){
    for (var i = 0; i < 4; i++) {
        this.axes[i] = new TouchAxis({ index: i });
    }
}

Touchpad.init = function(){
    this.registerButtons();
    this.registerAxes();
    this.connect();
}

function TouchButton(o){
    this.pressed = false;
    this.oldPressed = false;
    this.value = 0;
    this.oldValue = 0;
    this.index = o.index;
}

function TouchAxis(o){
    this.value = 0;
    this.oldValue = 0;
    this.index = o.index;
}

Touchpad.connect = function(){
    if(window["GamepadManager"]){
        var event = new Event('GamepadManager.gamepadConnected');
        event.gamepad = {id: this.id, buttons:this.buttons, axes:this.axes};
        window.dispatchEvent(event);
    }
}