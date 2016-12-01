var frequency = {
	"veryslow": 15,
	"slow": 5,
	"normal": 2,
	"fast": 1,
	"veryfast": 0.5,
}
var currentFrequency = "normal"

var chartDataCount = 50
var staticHeight = 80 + 60
var paddingCircles = 30
var font = "Courier New"

var dataCPU   = []
var dataRAM   = []
var dataDisks = []

var diskColors = ['#66D9EF', '#F92672', '#A6E22E', '#e6db74', '#7e8e91']

function loop() {
	sendAPIRequest()
	paintAll()
	window.setTimeout(loop, frequency[currentFrequency]*1000);
}

function populateFrequency() {
	var options = Object.keys(frequency)
	var select = document.getElementById("frequency")
	$.each(options, function( index, value ) {
		var option = document.createElement("option")
		option.text = value
		if(value == "normal")
			option.selected = true
		select.add(option);
	})
}

function changeFrequency() {
	var select = document.getElementById("frequency")
	var text = select.options[select.selectedIndex].text
	currentFrequency = text
}

window.onresize = function(event) {
    resize()
};

function resize() {
	paintAll()
};

window.onload = function () {
	populateFrequency()
	resize()
	loop()
}

function insertElem(array, elem) {
	array.push(elem)
	if(array.length > chartDataCount+1)
		array.shift();

	$.each(array, function( index, value ) {
		value['x'] -= 1
	});
}

function paintAll() {
	paintGrid("grid")
	paintArea("cpu", dataCPU, '102, 217, 239', 1)
	paintArea("ram", dataRAM, '249, 38, 114', 2)
	paintDisk("disks", dataDisks)
}

function paintGrid(elem) {

	var c2 = document.getElementById(elem).getContext('2d')

	$('#'+elem).attr("width",$(window).width())
	$('#'+elem).attr("height",$(window).height()/2)

	// Draw the chart itself
	c2.strokeStyle = "rgba(255, 255, 255, 0.1)";
	c2.beginPath();
	c2.moveTo(0, ((window.innerHeight/2)/5)*0+1)
	c2.lineTo(window.innerWidth, ((window.innerHeight/2)/5)*0+1)
	c2.moveTo(0, ((window.innerHeight/2)/5)*1)
	c2.lineTo(window.innerWidth, ((window.innerHeight/2)/5)*1)
	c2.moveTo(0, ((window.innerHeight/2)/5)*2)
	c2.lineTo(window.innerWidth, ((window.innerHeight/2)/5)*2)
	c2.moveTo(0, ((window.innerHeight/2)/5)*3)
	c2.lineTo(window.innerWidth, ((window.innerHeight/2)/5)*3)
	c2.moveTo(0, ((window.innerHeight/2)/5)*4)
	c2.lineTo(window.innerWidth, ((window.innerHeight/2)/5)*4)
    c2.lineWidth = 1;
	c2.stroke();
}

function paintArea(elem, array, color, offset) {

	if(!array)
		return

	var c2 = document.getElementById(elem).getContext('2d')

	$('#'+elem).attr("width",$(window).width());
	$('#'+elem).attr("height",$(window).height()/2);

	var first = array[0]
	var last = array.slice(-1)[0]
	var tick = window.innerWidth/(chartDataCount-1)

	c2.beginPath();
	c2.fillStyle = "rgba(" + color + ", 0.4)"
	$.each(array, function( index, value ) {
		if(index == 0) {
			c2.moveTo(value['x']*tick, (window.innerHeight/2)-(value['y']/100*window.innerHeight/2))
		} else {
			c2.lineTo(value['x']*tick, (window.innerHeight/2)-(value['y']/100*window.innerHeight/2))
		}
	});
	if (last && first) {
		c2.lineTo(last['x']*tick, window.innerHeight/2);
		c2.lineTo(first['x']*tick, window.innerHeight/2);
	}
	c2.closePath();
	c2.fill();

	c2.strokeStyle = "rgba(" + color + ", 1)"
	c2.beginPath();
	$.each(array, function( index, value ) {
		if(index == 0) {
			c2.moveTo(value['x']*tick, window.innerHeight/2)
			c2.lineTo(value['x']*tick, (window.innerHeight/2)-(value['y']/100*window.innerHeight/2))
		} else {
			c2.lineTo(value['x']*tick, (window.innerHeight/2)-(value['y']/100*window.innerHeight/2))
		}
	});
	c2.stroke();

	if (last) {
		c2.font="12px " + font
		c2.fillStyle="#FFF";
		c2.textAlign="end"; 
		c2.shadowColor = "black";
		c2.shadowOffsetX = 1; 
		c2.shadowOffsetY = 1; 
		c2.shadowBlur = 1;

		var text = elem + ' ' + last['y']
		c2.fillText(text, last['x']*tick-5, (window.innerHeight/2)-(last['y']/100*window.innerHeight/2)-5);
	}
}

function paintDisk(elem, array) {

	var c2 = document.getElementById(elem).getContext("2d");

	var width 	= $(window).width()
	var height 	= $(window).height()/2 - staticHeight/2

	var circleSize = (height-90)/2

	$('#'+elem).attr("width", width)
	$('#'+elem).attr("height", height)

	var j = 0
	for(var key in array) {

        if (j == diskColors.length) {
        	console.log('more disks than colors for disks')
        	console.log('you can add more on line 19')
        	console.log('var diskColors = [ ... ]')
        	break;
        }

        var x = circleSize*2 + paddingCircles*2
        var y = circleSize + paddingCircles

		var lastend = -0.5*Math.PI;
		var pie = array[key]
		if(pie != 0)
			var data = [100-Math.ceil(pie), Math.ceil(pie)]; // If you add more data values make sure you add more colors
		else
			var data = [0, 100];
		var myTotal = 0; // Automatically calculated so don't touch

		for (var e = 0; e < data.length; e++) {
		  myTotal += data[e];
		}

		for (var i = 0; i < data.length; i++) {
			if(i == 1)
				c2.globalAlpha = 0.1
			else
				c2.globalAlpha = 1.0
			c2.fillStyle = diskColors[j];
			c2.beginPath();
			c2.moveTo(x*j + circleSize + paddingCircles, y);
			// Arc Parameters: x, y, radius, startingAngle (radians), endingAngle (radians), antiClockwise (boolean)
			c2.arc(x*j + circleSize + paddingCircles, y, circleSize, lastend, lastend + (Math.PI * 2 * (data[i] / myTotal)), true);
			c2.lineTo(x*j + circleSize + paddingCircles, y);
			c2.fill();
			lastend += Math.PI * 2 * (data[i] / myTotal);
		}

		c2.globalAlpha = 1.0
		c2.font="24px " + font
		c2.fillStyle="#FFF";
		c2.textAlign="center"; 
		c2.shadowColor = "black";
		c2.shadowOffsetX = 1; 
		c2.shadowOffsetY = 1; 
		c2.shadowBlur = 1;

		var text = key
		c2.fillText(text, x*j + circleSize + paddingCircles, y*2);

		var text = array[key] + '%'
		c2.fillText(text, x*j + circleSize + paddingCircles, y*1.4);

		j++
	}	
}

function sendAPIRequest() {

	data = {
		"method": "getData",
		"data": [
			"cpu",
			"ram",
			"hdd",
			"uptime",
		]
	}

	$.ajax({
		type : "POST",
		url : "/api",
        data: JSON.stringify(data, null, '\t'),
		contentType: 'application/json',
        success: function(result) {

        	var json = result.results

			newCPUData = {x: chartDataCount, y: json['cpu'] }
			insertElem(dataCPU, newCPUData)

			newRAMData = {x: chartDataCount, y: json['ram'] }
			insertElem(dataRAM, newRAMData)

			dataDisks = json['hdd']

			updateHDD(json['hdd'])

			document.getElementById('connecting').innerHTML = getUptimeText(json['uptime'])
	    },
	    error: function (xhr, ajaxOptions, thrownError) {
			document.getElementById('connecting').innerHTML = 'connecting...'
		}
	});
}

function getUptimeText(uptime) {

	var y = Math.floor(uptime/60/60/24/365)
	var d = Math.floor(uptime/60/60/24)%365
	var h = ("0" + Math.floor(uptime/60/60)%24).slice(-2)
	var m = ("0" + Math.floor(uptime/60)%60).slice(-2)
	var s = ("0" + Math.floor(uptime)%60).slice(-2)

	var text = ''
	if (y > 0)
		text = y + ' years and ' + d + ' days'
	else if (d > 0)
		text = d + ' days, ' + h + ':' + m + ':' + s
	else
		text = h + ':' + m  + ':' + s

	return text
}

function updateHDD(hdd) {
	document.getElementById('disks').innerHTML = ''
	
	$.each(hdd, function( index, value ) {
		var text = 
		'<div class="disk">' +
	    	'<span class="label">' + index + '</span>' +
	    	'<span class="percent">' + value + '</span>' +
	    	'<div class="bar" style="width: ' + value + '%;"></div>' +
		'</div>'
		$("#disks").append(text)
	})
}