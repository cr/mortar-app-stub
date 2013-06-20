
'use strict';

var installBtn = document.getElementById( 'install-btn' );

if(installBtn) {
    
    installBtn.style.display = 'none';
    
    // If you want an installation button, add this to your HTML:
    //
    // <button id="install-btn">Install</button>
    //
    // This code shows the button if the apps platform is available
    // and this app isn't already installed.
    if( navigator.mozApps ) {

        installBtn.addEventListener('click', function() {
            navigator.mozApps.install(location.href + 'manifest.webapp');
        }, false);

        var req = navigator.mozApps.getSelf();
        req.onsuccess = function() {
            if(!req.result) {
                installBtn.style.display = 'block';
            }
        };

    }
}

var config = document.getElementById( 'config' );
var display = document.getElementById( 'display' );
var confirm = document.getElementById( 'confirm' );
var stateelement = document.getElementById( 'state' );
var timeelement = document.getElementById( 'time' );


// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback){
            window.setTimeout( callback, 1000 / 20);
        };
})();

var state = "config";

// timer state
var timer = {
    worklen: 10.0*60/60,
    slacklen: 5.0*60/60,
    working: true,
    started_at: 0,
    paused_at: 0
};

function configure() {
    state = "config";
    timer.started_at = 0;
    timer.paused_at = 0;
    config.style.display = 'block';
    display.style.display = 'none';
    confirm.style.display = 'none';
};

function start() {
    state = "running";
    timer.started_at = Date.now();
    timer.paused_at = 0;
    config.style.display = 'none';
    display.style.display = 'block';
    confirm.style.display = 'none';
}

function pause() {
    if( state == "running" ) {
        state = "paused";
        timer.paused_at = Date.now();
        confirm.style.display = 'block';
    }
}

function resume() {
    if( state == "paused" ) {
        state = "running";
        var pause_delay = Date.now() - timer.paused_at;
        timer.started_at += pause_delay;
        timer.paused_at = 0;
        confirm.style.display = 'none';
    }
}

function quit() {
    state = "quit";
    configure();
}

// Update objects
function update() {
    var running = (Date.now() - timer.started_at) / 1000.0;
    var rest;
    if( timer.working ) {
        rest = timer.worklen - running;
    } else {
        rest = timer.slacklen - running;
    }
    if( rest <= 0.0 ) {
        timer.working = ! timer.working;
        timer.started_at = Date.now();
        navigator.vibrate( [100, 100, 100] );
    }
};

var lastrunning;
function render() {
    var running = Math.floor( (Date.now() - timer.started_at) / 1000.0 );
    if( running == lastrunning ) return;
    var currentstate;
    var rest;
    if( timer.working ) {
        currentstate = "Working";
        stateelement.style.background = "#ff0000";
        rest = Math.min( timer.worklen - running, timer.worklen );
    } else {
        currentstate = "Slacking";
        stateelement.style.background = "#089a07";
        rest = Math.min( timer.slacklen - running, timer.slacklen );
    }

    var restminutes = Math.floor(rest/60).toString();
    var restseconds = Math.floor(rest%60).toString();
    restseconds = ("0"+restseconds).substr(-2)
    var reststring = restminutes + ":" + restseconds;

    stateelement.textContent = currentstate;
    timeelement.textContent = reststring;

    lastrunning = running;
};

function loop() {
    requestAnimFrame( loop );
    if( state == "running" ) {
        update();
        render();
    }
};

// Don't run when the tab isn't block
//window.addEventListener( 'focus', function() {
//    unpause();
//});

window.addEventListener( 'blur', function() {
    pause();
});

configure();
loop();
