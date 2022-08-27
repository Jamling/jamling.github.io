var TreeAddon = function(width, height, opts) {
		this.width = width;
		this.height = height;

		opts = opts || {};
		// branch
		this.maxCount = opts.hasOwnProperty('maxCount') ? opts.maxCount : 32;
		this.maxDepth = opts.hasOwnProperty('maxDepth') ? opts.maxDepth : 2;

		this.maxWidth = opts.hasOwnProperty('maxWidth') ? opts.maxWidth : 30;
		this.minArc = opts.hasOwnProperty('minArc') ? opts.minArc : 15;
		this.maxArc = opts.hasOwnProperty('maxArc') ? opts.maxArc : 45;
		this.maxLength = opts.hasOwnProperty('maxLength') ? opts.maxLength : 100;

		this.root = new BranchAddon(this);

		// bloom
		this.bloomWidth = opts.hasOwnProperty('bloomWidth') ? opts.bloomWidth : this.width;
		this.bloomHeight = opts.hasOwnProperty('bloomHeight') ? opts.bloomHeight : this.height;
		this.bloomRadius = opts.hasOwnProperty('bloomRadius') ? opts.bloomRadius : 120;
		// enable
		this.enable = opts.hasOwnProperty('enable') ? !! opts.enable : true;
	}

TreeAddon.prototype.add = function(c) {
	var i = 0;
	j = 0;
	for (; i < 4 && c > 0; i++) {
		for (; j < 3 && c > 0; j++) {
			var dir = i % 2 == 0 ? 0x00 : 0x10;
			var len = this.maxLength;
			if (i >= 2) {
				len *= 0.8;
			}
			if (j == 0) {
				this.root.addChild(0.7 - 0.15 * i, len, dir);
			} else {
				this.root.subs[i + 1].addChild(0.4 * j, 0, dir);
			}
			c--;
		}
		j = 0;
	}
};

TreeAddon.prototype.grow1 = function(c) {
	var start = 0.25;
	var step = 0.15;
	if (c < 4) {
		step = (0.8 - start) / 4;
	}
	for (var i = 0; i < 4 && this.count > 0; i++) {
		var len = this.maxLength;
		if (i < 2) {
			len *= 0.8;
		}
		this.root.addChild(0.35 + step * i, len, 0);
		this.count--;
	}
};

TreeAddon.prototype.grow2 = function() {
	for (var i = 0; i < 2 * 4 && this.count > 0; i++) {
		var len = this.maxLength;
		if (i < 2) {
			len *= 0.8;
		}
		var n = simpleFind(this.root);
		n.addChild(0.33 * (n.subs.length + 1), 0, 0);
		this.count--;
	}

	function simpleFind(p) {
		for (var i = 0; i < p.subs.length; i++) {
			var c = p.subs[i];
			if (c.subs.length < 2) {
				return c;
			}
		}
	}
};

TreeAddon.prototype.getBranches = function() {
	var c = this.maxCount;
	this.count = this.maxCount;
	if (c == 1) {
		this.root.addChild(0.5, 80, 0x10);
	} else {
		this.count--;
		this.grow1(c);
		this.grow2();
		this.root.addChild(0.8, 80, 0x10);
	}
	return [this.root.toArray()];
};

var BranchAddon = function(treeAddon, parent, idx) {
		this.treeAddon = treeAddon;
		this.parent = parent;
		this.idx = idx;
		this.subs = [];

		if (typeof(parent) === 'undefined') {
			this.dir = 0;
			this.depth = 0;
			this.width = this.treeAddon.maxWidth;
			// this.angle = window.random(this.treeAddon.minArc, this.treeAddon.maxArc) * Math.PI / 180 / 2;
			this.angle = /*window.random(5,15)*/
			100 * Math.PI / 180;
			this.startX = this.treeAddon.width / 2 - this.width;
			this.startY = this.treeAddon.height;
			this.endY = this.treeAddon.height * 0.2;
			//this.endX = this.startX - (this.startY - this.endY) * Math.tan(this.angle);
			this.endX = this.startX + (this.startY - this.endY) / Math.tan(this.angle);
			this.midX = window.random(this.endX, this.endX + this.width);
			this.midY = window.random(this.endY, this.endY + this.width);
			this.length = Math.sqrt((this.endY - this.startY) * (this.endY - this.startY) + (this.endX - this.startX) * (this.endX - this.startX));
			//this.length =
			this.trim();
			//console.log("root:" + this);
		} else {
			this.depth = parent.depth + 1;
			this.angle = window.random(this.treeAddon.minArc, this.treeAddon.maxArc) * Math.PI / 180;
			var ta = 45 * Math.PI / 180;
			if (parent.subs.length % 2 == 0) {
				ta = 0 - ta;
				this.dir = 1;
			}
			this.angle = parent.angle + ta;
		}

	}

BranchAddon.prototype.trim = function() {
	this.startX = Math.ceil(this.startX);
	this.startY = Math.ceil(this.startY);
	this.endX = Math.ceil(this.endX);
	this.endY = Math.ceil(this.endY);
	this.midX = Math.ceil(this.midX);
	this.midY = Math.ceil(this.midY);
	this.length = Math.ceil(this.length);
};

BranchAddon.prototype.toString = function() {
	return "(" + this.startX + "," + this.startY + ")," + "(" + this.endX + "," + this.endY + ")," + "(" + this.midX + "," + this.midY + ")," + "length:" + this.length + ",width=" + this.width + ",angle=" + (this.angle * 180 / Math.PI) + ",this.depth=" + this.depth + ",dir=" + this.dir;
};

BranchAddon.prototype.random = function(parent, startX, startY, length, depth, width) {
	this.treeAddon = treeAddon;
	this.startX = startX;
	this.startY = startY;
	this.length = length;
	this.angle = window.random(this.treeAddon.minArc, this.treeAddon.maxArc) * Math.PI / 180;

	var endX = startX + length * Math.cos(angle);
	var endY = startY + length * Math.sin(angle);

	var y = this.length * Math.sin(this.angle);
	var x = this.length * Math.cos(this.angle);

	this.endX = this.startX + x;
	this.endY = this.startY + y;
};

BranchAddon.prototype.line = function(p, subDir) {
	if (this.length > 0) {
		//return this.length;
	}
	var l = this.length * p;
	var x, y;
/*
  var tx = l * Math.sin(this.angle);// 90-a
  var ty = l * Math.cos(this.angle);//
  if (this.endX > this.startX) {
    x = this.startX + tx;
  }
  else {
    x = this.startX  - tx;
  }
  if (this.endY < this.startY) {
    y = this.startY - ty;
  }
  else {
    y = this.startY + ty;
  }
  */
	x = this.startX + l * Math.cos(this.angle);
	y = this.startY - l * Math.sin(this.angle);
	if (subDir == 1) {
		//x += this.width /2;
		//y += this.width /2;
	}
	return [x, y];
};

BranchAddon.prototype.addChild = function(p, len, dir) {
	var n = new BranchAddon(this.treeAddon, this, 0);
	var pt = this.line(p, n.dir);
	n.startX = pt[0];
	n.startY = pt[1];
	n.length = len ? len : this.length / 2;
	var r = 1 - p;
	if (n.depth > 1) {
		r = Math.pow(r, n.depth);
	}
	n.width = Math.ceil(this.width * r);

	var up = this.subs.length == 1 ? 1 : 0;
	if (this == this.treeAddon.root) {
		// vat t = this.subs[this.subs.length -1].dir;
		up = 0;
	}
	n.grow(up, this, p);
	n.trim();
	this.subs.push(n);
	//console.log("child:" + n);
};

BranchAddon.prototype.grow = function(up, p, r) {
/*
  var x = this.length * Math.sin(this.angle);
  var y = this.length * Math.cos(this.angle);

  var left = (this.dir & 0x10) == 0;
  if (left){
    this.endX = this.startX - x;
  }
  else {
    this.endX = this.startX + x;
  }
  if (up == 0) {
    this.endY = this.startY - y;

    if (left){
      this.midX = window.random(this.endX, this.endX + this.width);
    } else {
      this.midX = window.random(this.endX - this.width, this.endX);
    }
    this.midY = window.random(this.endY, this.endY + this.width);
  } else {
    up = 1;
    this.endY = this.startY + y;
    this.midX = window.random(this.endX, this.endX + this.width);
    if (left) {
      this.midX = window.random(this.endX, this.endX + this.width);
    } else {
      this.midX = window.random(this.endX - this.width, this.endX);
    }
    this.midY = window.random(this.endY - this.width, this.endY);
  }*/
	x = this.length * Math.cos(this.angle);
	y = this.length * Math.sin(this.angle);
	this.endX = this.startX + x;
	this.endY = this.startY - y;
	this.midY = window.random(this.endY, this.endY + this.width);
	if (this.startX < this.endX) {
		this.midX = window.random(this.endX - this.width, this.endX);
	} else {
		this.midX = window.random(this.startX, this.startX + this.width);
	}
	var minx = Math.min(this.startX, this.endX);
	this.midX = window.random(minx, minx + this.width);
	if (this.dir == 1) {
		this.midX = window.random(this.endX - this.width, this.endX);
	}

	//this.dir = (this.dir & 0x10) + up;
};

BranchAddon.prototype.toArray = function() {
	if (this.subs.length > 0) {

	}
	var l = this.depth == 0 ? 100 : this.length;
	var cs = [];
	for (var i = 0; i < this.subs.length; i++) {
		cs.push(this.subs[i].toArray());
	}
	var a = [this.startX, this.startY, this.midX, this.midY, this.endX, this.endY, this.width, l, cs];
	return a;
};

BranchAddon.prototype.getBounds = function() {
	var x = this.startX;
	var y = this.startY;
	var x2 = this.endX;
	var y2 = this.endY;
	for (var i = 0; i < this.subs.length; i++) {
		var c = this.subs[i];
		var p = c.getBounds();
		x = Math.min(x, p[0]);
		y = Math.min(y, p[1]);
		x2 = Math.max(x2, p[2]);
		y2 = Math.max(y2, p[3]);
	}
	return [x, y, x2, y2];
};

TreeAddon.prototype.getBounds = function() {
	return this.root.getBounds();
};

var DayAddon = function(lunar, boy, girl, date, option) {
		// 设置恋爱开始的时间,可以精确到秒
		var love_date = new Date();
		love_date.setFullYear(date.y ? date.y : 2010, date.M ? date.M - 1 : 0, date.d ? date.d : 1); //时间年月日
		love_date.setHours(date.h ? date.h : 0); //小时
		love_date.setMinutes(date.m ? date.m : 0); //分钟
		love_date.setSeconds(date.s ? date.s : 0); //秒前一位
		love_date.setMilliseconds(0); //秒第二位

		this.start = love_date;
		this.author = boy || '我';
		this.lover = girl || '你';
		this.festival = '天天';
		this.today = new Date();
		//this.today.setFullYear(2017, 02, 23);

		this.lunar = lunar.solar2lunar(this.today.getFullYear(), this.today.getMonth() + 1, this.today.getDate());
		this.option = option || {};
		this.sepcials = [];

		this.years = this.today.getFullYear() - love_date.getFullYear();
		var seconds = (Date.parse(this.today) - Date.parse(this.start)) / 1000;
		var days = Math.floor(seconds / (3600 * 24));
		seconds = seconds % (3600 * 24);
		var hours = Math.floor(seconds / 3600);
		if (hours < 10) {
			hours = "" + hours;
		}
		seconds = seconds % 3600;
		var minutes = Math.floor(seconds / 60);
		if (minutes < 10) {
			minutes = "" + minutes;
		}
		seconds = seconds % 60;
		if (seconds < 10) {
			seconds = "" + seconds;
		}
		var result = "第 <span class="\"digit\"">" + days + "</span> 天 <span class="\"digit\"">" + hours + "</span> 小时 <span class="\"digit\"">" + minutes + "</span> 分钟 <span class="\"digit\"">" + seconds + "</span> 秒";
		this.days = days;
	}

DayAddon.prototype.getDays = function() {
	return this.days;
};

DayAddon.prototype.lunarSpicial = function(y, m, d) {
	var ret = (m == this.lunar.lMonth && d == this.lunar.lDay);
	if (y > 0) {
		ret = ret && (y == this.lunar.lYear);
	}
	return ret;
};

DayAddon.prototype.solarSpicial = function(y, m, d) {
	var ret = (m == this.today.getMonth() + 1 && d == this.today.getDate());
	if (y > 0) {
		ret = ret && (y == this.today.getFullYear());
	}
	return ret;
};

DayAddon.prototype.addSpecial = function(word, y, m, d, lunar) {
	var f = !! lunar;
	this.sepcials.push({
		l: word,
		y: y,
		m: m,
		d: d,
		f: f
	});
};

DayAddon.prototype.isSpecial = function(day) {
	if (day.f) {
		return this.lunarSpicial(day.y, day.m, day.d);
	}
	return this.solarSpicial(day.y, day.m, day.d);
};

DayAddon.prototype.display = function() {
	for (var i = 0; i < this.sepcials.length; i++) {
		var d = this.sepcials[i];
		if (this.isSpecial(d)) {
			this.special = d;
			break;
		}
	}

	$('.lover').text(this.lover);
	$('.author').text(this.author);
	$('.years').text(this.years);
	if (this.special) {
		this.festival = this.special.l;
	}
	$('.festival').text(this.festival);

	var title = '祝' + this.lover + this.festival + '快乐！';
	document.title = title;

	if ( !! this.option.marqueeTitle) {
		var marqueeCount = 0;

		function marqueeTitle() {
			var end = marqueeCount % title.length;
			document.title = title.substr(0, end) || title;
			marqueeCount++;
			setTimeout('marqueeTitle()', 150);
		}
		marqueeTitle();
	}
};
