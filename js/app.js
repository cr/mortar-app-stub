/*
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
*/

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

// The player's state
var timer = {
    worklen: 25.0*60,
    slacklen: 5.0*60,
    working: true,
    started_at: 0,
    paused_at: 0
};

function configure() {
    state = "config";
    timer.started_at = 0;
    timer.paused_at = 0;
    config.style.visibility = 'visible';
    display.style.visibility = 'hidden';
    confirm.style.visibility = 'hidden';
};

function start() {
    state = "running";
    timer.started_at = Date.now();
    timer.paused_at = 0;
    config.style.visibility = 'hidden';
    display.style.visibility = 'visible';
    confirm.style.visibility = 'hidden';
}

function pause() {
    state = "paused";
    timer.paused_at = Date.now();
    confirm.style.visibility = 'visible';
}

function resume() {
    state = "running";
    pause_delay = Date.now() - timer.paused_at;
    timer.started += pause_delay;
    timer_paused_at = 0;
    confirm.style.visibility = 'hidden';
}

function quit() {
    state = "quit";
}

// Update objects
function update( dt ) {
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
        stateelement.style.background = "orange";
        rest = Math.min( timer.worklen - running + 1, timer.worklen );
    } else {
        currentstate = "Slacking";
        stateelement.style.background = "green";
        rest = Math.min( timer.slacklen - running + 1, timer.slacklen );
    }

    var restminutes = Math.floor(rest/60).toString();
    var restseconds = Math.floor(rest%60).toString();
    restseconds = ("0"+restseconds).substr(-2)
    reststring = restminutes + ":" + restseconds;

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



// Don't run the game when the tab isn't visible
//window.addEventListener( 'focus', function() {
//    unpause();
//});

//window.addEventListener( 'blur', function() {
//    pause();
//});

var then = Date.now();
configure();
loop();
