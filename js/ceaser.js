	var canvas = document.getElementById('curve'),
		ctx = canvas.getContext('2d'),
		box = document.getElementById('box'),
		code = document.getElementById('codeOutput'),
		supportTouches = ('createTouch' in document), //nabbed from Desandro, excellent work
		time = document.getElementById('time'),
		timeVal = 500;

	
	// contructor
	function BezierHandle(x, y) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
	}
	
	// get the edges for easy grabby coordinates
	BezierHandle.prototype.getSides = function() {	
		this.left = this.x - (this.width / 2);
		this.right = this.left + this.width;
		this.top = this.y - (this.height / 2);
		this.bottom = this.top + this.height;
	};
	
	// draw the handles
	BezierHandle.prototype.draw = function() {
		// figre out the edges
		this.getSides();
		ctx.fillStyle = "#222";
		ctx.fillRect(this.left, this.top, this.width, this.height);
	};
	
	// make 2 new handles
	var handles = [
				new BezierHandle(50,150),
				new BezierHandle(150,50)
				];
	
	// get the x and y pos, normalized by getOffset
	function getPos(event) {
		var mouseX = event.pageX - getOffSet(event.target).left,
	    	mouseY = event.pageY - getOffSet(event.target).top;
	
		return {
			x: mouseX,
			y: mouseY
		};
	}
	
	//from quirksmode.org. nice work, but modified slightly to return obj
	function getOffSet(obj) {
		var curleft = curtop = 0;
	    if (obj.offsetParent) {
	        do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
	        } 
	        while (obj = obj.offsetParent);
	
	    	return { 
				left: curleft,
				top: curtop
			};
		}
	}
	
	
	var drag = false,
		draggingObj,
		oldX,
		oldY;
	
	function onPress(event) {
		//console.log('press')
		
		// to get rid of text cursor
		event.preventDefault();
		event.stopPropagation();
		
		var cursorEvent = supportTouches ? event.touches[0] : event;
		
		var mouseCoordinates = getPos(cursorEvent),
			x = mouseCoordinates.x,
			y = mouseCoordinates.y;
			
		
		//check to see if over any handles
		for (var i=0; i < handles.length; i++) {
			var current = handles[i],
				curLeft = current.left,
				curRight = current.right,
				curTop = current.top,
				curBottom = current.bottom;
			
			//20 px padding for chubby fingers
			if ( supportTouches ) {
				curLeft -= 20;
				curRight += 20;
				curTop -= 20;
				curBottom += 20;
			}
			
			//console.log('current.x:',current.x, 'current.y:',current.y)
			if (x >= curLeft &&
				x <= curRight &&
				y >= curTop &&
				y <= curBottom
				) {
					//over the current handle
					//console.log('over')
					drag = true;
					draggingObj = current;
					oldX = x;
					oldY = y;
					
					var currentlySelected = $('#presets option:selected');
					
					currentlySelected.attr('selected', '')
									 .parent().parent().find('option').last().attr('selected', 'selected');
									
					// set move cursor
					event.target.style.cursor = 'move';
					
			}
		}
		
	}
	
	
	function onMove(event) {
		
		var cursorEvent = supportTouches ? event.touches[0] : event;
		
		if (drag) {
			var mouseCoordinates = getPos(cursorEvent),
				x = mouseCoordinates.x,
				y = mouseCoordinates.y;
			
			//console.log('x:', x, 'y:', y)
			
			// get oldX, get x, subtract to get the delta
			dx = x - oldX;
			dy = y - oldY;
			
			draggingObj.x += dx;
			draggingObj.y += dy;
			
			// make sure its within the bounds
			if (draggingObj.x < 0) draggingObj.x = 0;
			if (draggingObj.x > canvas.width) draggingObj.x = canvas.width;
			if (draggingObj.y < 0) draggingObj.y = 0;
			if (draggingObj.y > canvas.height) draggingObj.y = canvas.height;
			
			// set the new oldX
			oldX = x;
			oldY = y;
			
			updateDrawing();
		}
		
	}
	
	function onRelease(event) {
		//console.log('release')
		drag = false;
		
		// restore pointer cursor
		event.target.style.cursor = 'pointer';
	}
	
	
	
	canvas.addEventListener('mousemove', onMove, false);
	canvas.addEventListener('touchmove', function(event) {
		onMove(event);
		event.preventDefault();
	}, false);
	
	canvas.addEventListener('mousedown', onPress, false);
	canvas.addEventListener('touchstart', function(event) {
		onPress(event);
		event.preventDefault();
	}, false);
	
	canvas.addEventListener('mouseup', onRelease, false);
	canvas.addEventListener('touchend', function(event) {
		onRelease(event);
		event.preventDefault();
	}, false);
	
	
	function updateDrawing() {
		// clear
		ctx.clearRect(0,0,canvas.width,canvas.height);
		
		// get handles
		var cp1 = handles[0],
			cp2 = handles[1];
			
		// draw bezier curve
		ctx.save();
		ctx.strokeStyle = '#4C84D3';
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(0,canvas.height);
		//start at bottom left, first handle is cp1, second handle is cp2, end is top right
		ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, canvas.width, 0);
		ctx.stroke();
		ctx.restore();
			
		// draw anchor point lines
		ctx.strokeStyle = '#f00';
		ctx.beginPath();
		ctx.moveTo(0,canvas.height);
		ctx.lineTo(cp1.x, cp1.y);
		ctx.moveTo(canvas.width,0);
		ctx.lineTo(cp2.x, cp2.y);
		ctx.stroke();

		// draw handles
		for (var i=0; i < handles.length; i++) {
			handles[i].draw();
		}
		
		//console.log(cp1.x, cp1.y, cp2.x, cp2.y)
		
		// output code
		var	x1 = (cp1.x / canvas.width).toFixed(3),
			y1 = ( (canvas.height - cp1.y) / canvas.height ).toFixed(3),
			x2 = (cp2.x / canvas.width).toFixed(3),
			y2 = ( (canvas.height - cp2.y) / canvas.height ).toFixed(3),
			
			//console.log( cp1.x, cp1.y )
			points = '(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')',
			bezier = 'cubic-bezier' + points;
		
		// output code snippets
		code.innerHTML = 
						'<p>-webkit-transition: all ' + timeVal + 'ms ' + bezier +
						'; <br>&nbsp;&nbsp; -moz-transition: all ' + timeVal + 'ms ' + bezier +
						'; <br>&nbsp;&nbsp;&nbsp;&nbsp; -o-transition: all ' + timeVal + 'ms ' + bezier +
						'; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; transition: all ' + timeVal + 'ms ' + bezier +
						'; </p><p> -webkit-transition-timing-function: ' + bezier +
						'; <br>&nbsp;&nbsp; -moz-transition-timing-function: ' + bezier +
						'; <br>&nbsp;&nbsp;&nbsp;&nbsp; -o-transition-timing-function: ' + bezier +
						'; <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; transition-timing-function: ' + bezier + '; </p>';
		
	}
	
		
	function setTransitions() {
		
		var cp1 = handles[0],
			cp2 = handles[1],
			
			x1 = (cp1.x / canvas.width).toFixed(2),
			y1 = ( (canvas.height - cp1.y) / canvas.height).toFixed(2),
			x2 = (cp2.x / canvas.width).toFixed(2),
			y2 = ( (canvas.height - cp2.y) / canvas.height).toFixed(2),
			
			//console.log( cp1.x, cp1.y )
			points = '(' + x1 + ', ' + y1 + ', ' + x2 + ', ' + y2 + ')';
 			
		//console.log(points)
		
		timeVal = time.value;
		
		
		// set all transition types. ugly ugly vendor prefixes
		box.style.WebkitTransition =
		box.style.MozTransition =
		box.style.OTransition =
		box.style.transition =
		 					   'all ' + timeVal + 'ms cubic-bezier' + points;
		
	}
	
	setTransitions();
	updateDrawing();

	
	function presetChange() {
			
		var coordinates = this.value.split(','),
			cp1 = handles[0],
			cp2 = handles[1];

		cp1.x = coordinates[0] * canvas.width;
		cp1.y = canvas.height - (coordinates[1] * canvas.height);
		cp2.x = coordinates[2] * canvas.width;
		cp2.y = canvas.height - (coordinates[3] * canvas.height);
		
		updateDrawing();
		
	}
	
	var $presets = $('#presets'),
		$time = $('#time'),
		$presetOpts = $('#presets option');
	
	$presets.change(presetChange);
	
	// get the button value and toggle the class
	$('.testButton').click(function() {
		setTransitions();
		updateDrawing();
		$('#box').toggleClass( $(this).val() );
	});
	
	$time.change(function() {
		setTransitions();
		updateDrawing();
	});
	
	$time.keyup(function() {
		$(this).trigger('change');
	});
	
	
	// arrow key support
	
	$(document).keydown(function(event) {
	
		if ( event.keyCode === 39 && event.target !== time ) {
			//right key && not in time input
			var currentlySelected = $('#presets option:selected'),
				currentIdx = $presetOpts.index(currentlySelected);

			if ( currentIdx < $presetOpts.length - 1 ) {
				currentlySelected.attr('selected', '');
				$presetOpts.eq( currentIdx + 1 ).attr('selected', 'selected');
				$presets.trigger('change');
			}
		} else if ( event.keyCode === 37  && event.target !== time ) {
			// left key && not in time input
			var currentlySelected = $('#presets option:selected'),
				currentIdx = $presetOpts.index(currentlySelected);
				
			if ( currentIdx > 0 ) {
				currentlySelected.attr('selected', '');
				$presetOpts.eq( currentIdx - 1 ).attr('selected', 'selected');
				$presets.trigger('change');
			}
		}
		
	});
