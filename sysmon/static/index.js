var frequency = {
	"veryslow": 15,
	"slow": 5,
	"normal": 2,
	"fast": 1,
	"veryfast": 0.5,
}
var currentFrequency = "normal"

var chartDataCount = 50

var charts = [];

var dataCPU = []
var dataRAM = []

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
	var cpu = document.getElementById("cpu")
	var ram = document.getElementById("ram")
	var disks = document.getElementById("disks")
	var staticHeight = 80 + 60

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
	paint("cpu", dataCPU, '102, 217, 239', 1)
	paint("ram", dataRAM, '249, 38, 114', 2)
	paintGrid("grid")
}

function paint(elem, array, color, offset) {

	if(!array)
		return

	var c2 = document.getElementById(elem).getContext('2d');

	$('#'+elem).attr("width",$(window).width());
	$('#'+elem).attr("height",$(window).height()/2);

	var first = array[0]
	var last = array.slice(-1)[0]
	var tick = window.innerWidth/(chartDataCount-1)

	// Create the 'mask' - it has the same path than the chart, but then follow the above rectangle.
	c2.beginPath();
	c2.fillStyle = "rgba(" + color + ", 0.4)"//'#272822';
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

	// Draw the chart itself
	c2.strokeStyle = "rgba(" + color + ", 1)";
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
		c2.font="12px Georgia";
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

function sendAPIRequest() {

	data = {
		"method": "getData",
		"data": [
			"cpu",
			"ram",
			"hdd",
			//"net",
			"uptime",
			"name",
			"ip",
			"user",
			"os",
		]
	}

	$.ajax({
		type : "POST",
		url : "/api",
        data: JSON.stringify(data, null, '\t'),
		contentType: 'application/json',
        success: function(result) {
        	console.log(result.results)
        	var json = result.results
			newCPUData = {x: chartDataCount, y: json['cpu'] }
			insertElem(dataCPU, newCPUData)
			newRAMData = {x: chartDataCount, y: json['ram'] }
			insertElem(dataRAM, newRAMData)

			updateHDD(json['hdd'])
			updateInfo(json['user'], json['os'], json['name'], json['ipv6'], json['ipv4'], json['uptime'], json['net'])
			document.getElementById('connecting').innerHTML = ''
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

function updateInfo(user, os, name, ipv6, ipv4, uptime, net) {
	var text = '<table>'
	text += getInfoItemOneCell(user, name)
	text += getInfoItem('name', name)
	text += getInfoItem('uptime', getUptimeText(uptime))
	text += getInfoItem('ipv6', ipv6)
	text += getInfoItem('ipv4', ipv4)
	$.each(net, function( index, value ) {
		text += getInfoItem(index, value)
	})
	text += '</table>'
	document.getElementById('other').innerHTML = text
}
function getInfoItemOneCell(value, data) {
	var text =
	'<tr>' +
		'<th>' + value + ' ' +data + '</th>' +
	'</tr>'
	return text
}
function getInfoItem(value, data) {
	var text =
	'<tr>' +
		'<th>' + value +'</th>' +
		'<td>' + data + '</td>' +
	'</tr>'
	return text
}