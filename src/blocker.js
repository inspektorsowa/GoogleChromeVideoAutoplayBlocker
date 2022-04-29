/**

Please note this code is not very beatiful. But it works.
At the time I just wanted to fix the problem with videos autoplaying.
Today I'd write it in a better way. But I probably won't :-)
Cheers.

Robert

**/

var DEBUG = false;
var DOMAIN_WHITELIST = ["youtube.com", "vimeo.com", "netflix.com", "vod.pl", "cda.pl", "hbogo.pl", "primevideo.com"];

var BUTTON_TEXT = 'CLICK HERE TO PLAY THE VIDEO';

var STATE_INIT = 'init';
var STATE_BLOCKED = 'blocked';
var STATE_ALLOWED = 'allowed';


/**
 * Initialize the event listeners when added new node.
 * 
 * @param event
 */
function initApp(event) {
	
	for (var i=0; i<DOMAIN_WHITELIST.length; i++) {
		if (location.href.match(DOMAIN_WHITELIST[i])) {
			debug('--- whitelist');
			return true;
		}
	}
	
	if (typeof event == 'undefined') {
		debug('--- init blocker');
		addVideoListeners(document.getElementsByTagName('video'));
	} else {
//		debug('--- tagName: '+ event.target.tagName);
		if (typeof event.target.tagName == 'string' && event.target.tagName.toUpperCase() == 'VIDEO') {
			debug('--- video dom node inserted');
			addVideoListeners([event.target]);
		}
	}
}
document.addEventListener('DOMNodeInserted', initApp);
document.addEventListener('DOMContentLoaded', function() {
	var videos = document.getElementsByTagName('video');
	for (var i=0; i<videos.length; i++) {
		if (videos[i].autoplay) {
			videos[i].pause();
			videos[i].videoState = STATE_BLOCKED;
			videos[i].videoAllowButton = createAllowButton(videos[i]);
		}
	}
	initApp();
});
setTimeout(initApp, 1000);



/**
 * Add the video event listener.
 * 
 * @param videos Node list.
 */
function addVideoListeners(videos) {
	debug('--- new nodes = '+ videos.length);
	for (var i=0; i<videos.length; i++) {
		var video = videos[i];
		if (typeof video.videoBlocked == 'undefined') {
			
			debug('--- new node listener for '+ video.getAttribute('src'));
			
			video.videoState = STATE_INIT;
			video.pause();
			
			video.addEventListener('playing', function(ev) {
				debug('--- playing with state '+ this.videoState + ' --- '+ video.getAttribute('src'));
				if (STATE_ALLOWED != this.videoState) {
					this.videoState = STATE_BLOCKED;
					this.pause();
					if (typeof this.videoAllowButton == 'undefined') {
						this.videoAllowButton = createAllowButton(this);
					} else {
						this.videoAllowButton.style.display = 'block';
					}
				}
			}, false);
			
		}
	}
}


/**
 * Create and display the allow button.
 * 
 * @param video
 * @returns DOMElement
 */
function createAllowButton(video) {
	debug('--- createAllowButton');
	
	var offset = cumulativeOffset(video);
	debug('--- offset = '+ offset.top +', '+ offset.left);
	var btn = document.createElement('div');
	btn.className = 'video-blocker-btn';
	btn.innerText = BUTTON_TEXT;
	btn.style.position = 'absolute';
	btn.style.zIndex = 99999;
	btn.style.top = ""+offset.top +"px";
	btn.style.left = ""+offset.left +"px";
	btn.style.background = 'red';
	btn.style.fontSize = '15px';
	btn.style.cursor = 'pointer';
	
	document.body.appendChild(btn);
	
	btn.addEventListener('click', function() {
		btn.style.display = 'none';
		video.videoState = STATE_ALLOWED;
		video.play();
	});
	
	return btn;
	
}


/**
 * Calculate the element's offset.
 * 
 * @param element
 * @returns object Top and left offset.
 */
function cumulativeOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};


/**
 * Debug handler.
 *
 * @param msg
 */
function debug(msg) {
	if (DEBUG) {
		console.log(msg);
	}
}

