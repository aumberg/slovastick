// slovastick - web-based DOM manipulator
// manifesto  - http://minifesto.org/
(function($) {
	var s = window.slovastick = function(param) {
		if ("function" === typeof param)
			check({after:[param]});
		else if ("object" === typeof param)
			$.extend(s, objExtend);
		else
			check({after:[s.on]});
	};
	//
	s.opt = {
		program: {
			name 		: "slovastick",
			description	: "slovastick - web-based DOM manipulator",
			version 	: "0.0.3",
			debugMod	: false, //false || true || "all"
			status		: "off",
			debugSrc 	: "http://localhost/",
			programSrc	: "",
			pluginSrc	: "",
			soundSrc	: ""
		},
		user: {
			sound: {
				volume	: 70
			}
		},
		browser: {
			"name"		: undefined,
			"version"	: undefined
		}
	};
	//
	s.lib = {
		//
		audio: {
			"playSignal": (function() {
				var objAudioSignal = window.document.createElement("audio");

				if ( !(objAudioSignal && objAudioSignal.canPlayType) )
					return function() {};

				if (objAudioSignal.canPlayType("audio/mpeg"))
					var ext = ".mp3";
				else if (objAudioSignal.canPlayType("audio/ogg"))
					var ext = ".ogg";
				else
					var ext = ".wav";

				return function(strSignalName) {
					if (!s.opt.user.sound.volume)
						return;

					objAudioSignal.volume = s.opt.user.sound.volume / 100;
					objAudioSignal.pause();
					objAudioSignal.src = s.opt.program.soundSrc + strSignalName + ext;
					objAudioSignal.play();
				}
			}())
		},
		// button checker
		button: (function() {
			var b = {
				name 		: {
					"enter"		: 13,
					"shift" 	: 16,
					"control" 	: 17,
					"alt" 		: 18,
					"left" 		: 37,
					"up" 		: 38,
					"right" 	: 39,
					"down" 		: 40
				},
				// last pressed buttons
				last 		: {},
				// count of pressed buttons
				"count"		: function() {
					result = 0;

					$.each(b.name, function(buttonName) {
						if (b[buttonName])
							result++;
					})

					return result;
				},
				//
				"keycode"	: function(buttonName) {
					var result = false;

					$.each(b.name, function(name, code){
						if (buttonName === code) {
							result = name;

							return false;
						}
					})

					return result;
				},
				// 'keydown' event catch
				"keydown"	: function(param) {
					// param === jquery event
					if ("object" === typeof param)
						var buttonName = b.keycode(param.which);
					//
					if (!buttonName || !!b[buttonName])
						return false;

					clearTimeout(b[buttonName]);
					b.last.keydown 			= buttonName;
					b[b.name[buttonName]] 	= b[buttonName] = setTimeout(function() {
						delete b[b.name[buttonName]];
						delete b[buttonName];
					}, 5000);

					return true;
				},
				// 'keyup' event catch
				"keyup"		: function(param) {
					// clear all
					if (!param) {
						$.each(b.name, function(buttonName) {
							clearTimeout(b[buttonName]);
							delete b[buttonName];
						})

						delete b.last.keydown;
						delete b.last.keyup;

						return true;
					}
					// param === jquery event
					if ("object" === typeof param)
						var buttonName = b.keycode(param.which);

					if (!buttonName || !b[buttonName])
						return false;

					clearTimeout(b[buttonName])
					b.last.keyup = buttonName;
					delete b[b.name[buttonName]];
					delete b[buttonName];

					return true;
				},
				// test pushed buttons
				// arguments: (["control"], ["shift"]) 	- control OR shift
				// arguments: (["control", "shift"]) 	- control AND shift
				"has"		: function() {
					for (var i = 0; i < arguments.length; i++) {
						var masHas = [],
							isOk = true;

						if (!$.isArray(arguments[i]))
							s.err("bad arg for 'has' function", arguments[i]);

						for (var j in arguments[i]) {
							var name = arguments[i][j];

							if (!b[name]) {
								isOk = false;

								break;
							}

							if (-1 === $.inArray(name, masHas))
								masHas.push(name);
						}

						if (isOk && (masHas.length === b.count()))
							return true;
					}

					return false;
				} 
			};
			// 
			return b;
		}()),
		// xpath search in document
		// code copied and modified from firebug/lib/xpath.js 
		"xpath": function(elementOrStrXPath, contexts) {
			if ("string" === typeof elementOrStrXPath) {
				var masElements = [],
					masElementsContext = [],
					strXPath = elementOrStrXPath;

				if (!strXPath)
					strXPath = ".";
				else if ("/" === strXPath[0])
					strXPath = "." + strXPath;

				if (contexts)
					masElementsContext = $.isArray(contexts) ? contexts : [contexts];
				else
					masElementsContext = [window.document];
					
				for (var i in masElementsContext) {
					var c = $(masElementsContext[i])[0];

					try {
						xpath = window.document.evaluate(strXPath, c, null, 0, null);
					}
					catch (e) {
						return [];
					}

					for (var node; xpath && (node = xpath.iterateNext()); ) {
						masElements.push($(node));
					}
				}

				if ("all" === s.opt.program.debugMod) {
					var args = ["search " + strXPath]

					if (!contexts || !contexts.length)
						args.push("from context document")
					else 
						args = args.concat(["from contexts", masElementsContext]);

					if (!masElements.length)
						args.push("and nothing found!")
					else 
						args = args.concat(["and found", masElements]);

					s.log.apply(this, args);
				}

				return masElements;
			}
			else if ("object" === typeof elementOrStrXPath){
				var masXPath = [];

				for (var element = $(elementOrStrXPath)[0]; element && (1 === element.nodeType); element = element.parentNode) {
					if (element.id) {
						masXPath.unshift("/*[@id='" + element.id + "']");

						break;
					}

					var position = 1;

					for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
						if (10 === sibling.nodeType)
							continue;

						if (sibling.nodeName == element.nodeName)
							position++;
					}

					var tagName = element.nodeName.toLowerCase(),
						pathIndex = (1 < position) ? "[" + position + "]" : "";

					masXPath.unshift(tagName + pathIndex);
				}
				// result string or null
				return masXPath.length ? "/" + masXPath.join("/") : null;
			}
		},
		// function for list-manipulating object data
		"key": function(obj) {
			obj["key"] = function(param, param2) {
				obj.key.memory = (obj.key.memory || []);
				// remove all keys
				if (null === param) {
					obj.key.memory = [];

					return obj;
				}
				// get all keys
				else if (undefined === param) {
					if (undefined === param2)
						return obj.key.memory;
				}
				// 
				else if ("string" === typeof param) {
					// remove key
					if (null === param2) {
						var mem2 = [];

						for (var i in obj.key.memory) {
							if (param !== obj.key.memory[i].name)
								mem2.push(obj.key.memory[i]);
						}

						obj.key.memory = mem2;

						return obj;
					}
					// find key
					else if (undefined === param2) {
						for (var i = 0; i < obj.key.memory.length; i++) {
							if (param === obj.key.memory[i].name)
								return $.extend({}, obj.key.memory[i], {"index": i});
						}
						// !!!return empty object!!!
						return {};
					}
					// set key
					else if ("string" === typeof param2) {
						return obj.key({"name": param, "value": param2});
					}
				}
				//
				else if ($.isArray(param)) {
					// set keys
					if (undefined === param2) {
						for (var i in param) {
							if ("object" !== typeof param[i])
								throw ["when call key, bad first argument ", arguments];

							obj.key(param[i]);
						}

						return obj;
					}
				}
				//
				else if ("object" === typeof param) {
					// set key
					if (undefined === param2) {
						if ("string" !== typeof param.name || "string" !== typeof param.value)
							throw ["when call key not setted key or value ", arguments];

						obj.key(param.name, null);
						obj.key.memory.push(param);

						return obj;
					}
				}

				throw ["key can't work with ", param, param2, " in ", obj];
			}

			return obj;
		},
		// massive of elements with slovastick actions and virtual s-attributes
		"masEle": function(masEle) {
			if (!$.isArray(masEle))
				throw "that not massive";

			$.each(masEle, function(index, ele) {
				masEle[index] = ele = $(ele);
				s.lib.key(ele);
				ele.and = {};

				$.each(s, function(strKey, objValue) {
					if ($.isFunction(objValue)) {
						ele[strKey] = function () {
							return s[strKey](ele);
						};

						ele.and[strKey] = function () {
							ele[strKey]();

							return ele;
						};
					}
				})

				var realAttributes = (ele[0].attributes || []);

				$.each(realAttributes, function(index, attrib) {
					if (attrib.name && "s-" === attrib.name.slice(0, 2))
						ele.key(attrib.name.slice(2), attrib.value);
				})
			});

			masEle["run"] = function () {
				return s["run"](masEle);
			};

			masEle["key"] = function(param, param2) {
				var result = [];

				$.each(masEle, function(index, ele) {
					result.push(ele.key(param, param2));
				});

				return result;
			};

			masEle.and = {
				"key": function () {
					masEle["key"]();

					return masEle;
				},
				"run": function () {
					masEle["run"]();

					return masEle;
				}
			};

			return masEle;
		},
		//
		"ele": function(ele) {
			return s.lib.masEle([ele])[0];
		},
		// 
		"scrollTop": function(element, scrollTopParams) {
			// worked only in Chrome
			if ($(element).is(':hidden'))
				return false;
			//
			var offset 			= $(element).offset(),
				scrollTopValue 	= parseInt(offset ? offset.top : 0) - Math.round($(window).height()/2) + "px";

			if ($.isPlainObject(scrollTopParams))
				scrollTopParams	= $.extend(defaults, scrollTopParams);
			else
				scrollTopParams	= {"duration": 300, "easing": "swing"};

			$("html, body")
				.stop(true)
				.animate({"scrollTop": scrollTopValue}, scrollTopParams);
		},
		//
		"designate": function(masElements, scrollTopParams) {
			if (!masElements)
				masElements = [];
			else if (!$.isArray(masElements))
				masElements = [masElements];

			$.each(masElements, function(index, element) {
				element 	= $(element);

				var offset 	= element.offset();

				if (scrollTopParams)
					s.lib.scrollTop(element.focus().get(0), scrollTopParams);

				$("<div s-null>")
					.css({
						"position": "absolute",
						"width": element.css("width"),
						"height": element.css("height"),
						"left": offset.left,
						"top": offset.top,
						"background-color": "green",
						"z-index": "2147483647"
					})
					.prependTo(s.opt.slovastick)
					.delay().animate({"opacity": 0}, 400, function() {
						$(this).remove();
					});

				// // !!! don't animate internal blocks !!!
				// element.each(function(index, element) {
				// 	if (-1 === $.inArray(element.tagName, ["IMG", "OBJECT"])) {
				// 		var oldBgcolor = $(element).css("background-color");
				// 		$(element).css("background-color", "green");

				// 		setTimeout(function () {
				// 			$(element).css("background-color", oldBgcolor);
				// 		}, 400)

				// 		return;
				// 	}
				// })
			});

			return true;
		},
		// change console value to near element and run him
		"move": function(strDirection) {
			var	val  		= s.opt.console.val(),
				element 	= s.lib.xpath(val)[0];

			if (!element)
				return s.err("I stop there...");

			var ele 		= s.lib.ele(element),
				isUpOrDown 	= (-1 !== $.inArray(strDirection, ["up", "down"])),
				ind 		= (parseInt(ele.key("see-position").value) - 1 || 0),
				direct 		= {
					up 		: "/preceding-sibling::*",
					down 	: "/following-sibling::*",
					left 	: "/ancestor::*",
					right 	: "/child::*"
				};
			// change attribute s-see-position
			if ((-1 < ind) && isUpOrDown) {
				var res = ele.key("see-position", null).see();

				if (!res[ind])
					ind = ((0 < ind) && res.length) ? res.length - 1 : 0;

				if ("up" === strDirection)
					var fun = function() {
						return res[--ind];
					}
				else
					var fun = function() {
						return res[++ind];
					}

				while (fun()) {
					var res2 = res[ind].run();

					if (res2) {
						$(ele[0]).attr("s-see-position", (ind + 1).toString());
						s.ok("I move " + strDirection);

						return s.lib.designate(res2, true);
					}
				}
			}
			// find currect elements
			var masSiblings = s.lib.xpath(val + direct[strDirection]);

			if (-1 !== $.inArray(s.opt.browser.name, ["mozilla", "msie"]) 
				&& ("left" === strDirection || "up" === strDirection))
					masSiblings.reverse();

			for (var i 	= 0; i < masSiblings.length; i++) {
				var ele = s.lib.ele(masSiblings[i]);

				if (ele.key("see") && !ele.see().length)
					ele.key("see-position", "1");

				var res = ele.run();

				if (res) {
					s.opt.console.val(s.lib.xpath(ele));
					$(ele[0]).attr("s-see-position", ele.key("see-position").value);
					s.ok("I move " + strDirection);

					return s.lib.designate(res, true);
				}
			}

			return s.err("I stop there...");
		},
		// 
		"plugin": function(strPath, callback) {
			// 
			function parse(index, element) {
				if (!element.tagName || "#" === element.nodeName[0])
					return;

				s.opt.slovastick.children(element.tagName)
					.remove();

				s.opt.slovastick
					.append(element);
			}
			//
			function finaly() {
				s.opt.result 	= $("#slovastick_result", 	s.opt.slovastick);
				s.opt.panel 	= $("#slovastick_panel", 	s.opt.slovastick);
				s.opt.console 	= $("#slovastick_console", 	s.opt.slovastick);

				if (s.go())
					s.lib.move("right");
				else
					s.ok("I loaded plugin");

				if ("function" === typeof callback)
					callback();
			}
			//
			$.ajax(strPath, {
				dataType: 'text',
				cache: false,
				success: function(data) {
					try {
						var doc = $($.parseXML(data));
						doc.children().each(parse);
						finaly();
					}
					catch (e) {
						try {
							var elements = $($.parseHTML(data, false)); //keepScripts = true
							elements.each(parse);
							finaly();
						}
						catch (e) {
							s.err("I can't find correct plugin for that site", e);
						}
					}
				},
				complete: callback
			});
		}
	};
	//
	s["off"] = function () {
		$(window).add($("*", "body"))
			.off(".slovastick .slovastick-console .slovastick-move .slovastick-mouseover");
		
		if (s.opt.panel)
			s.opt.panel.css("display", "none");

		s.opt.program.status = "off";
	};
	//
	s["on"] = function () {
		s["off"]();

		if (!s.opt.panel)
			return null;

		s.opt.panel
			.attr("title", s.opt.program.description + ", version " + s.opt.program.version)
			.css("display", "block");

		s.opt.console
			.on("focus", function() {
				s.opt.console.data("focused", "focused");
				s.log("I'am on console");
			})
			.on("blur", function() {
				s.opt.console.removeData("focused");
				s.ok("I'am on element");
			})
			.on("click", function() {
				if ("10px" === s.opt.panel.css("right"))
					s.opt.panel.css({"left":"10px", "right":"auto"});
				else
					s.opt.panel.css({"left":"auto", "right":"10px"});
			})
			.on("keypress.slovastick", function(event) {	
				if (s.lib.button.has(["enter"])) {
					var val  = $(this).val(),
						isOk = true;

					// is XML ?
					if (/^\s*</.test(val)) {
						$($.parseHTML(val, true)) //keepScripts = true
							.each(function(index, element) {
								if (!element.tagName || "#text" === element.nodeName)
									return;

								s.opt.slovastick.children(element.tagName)
									.remove();

								s.opt.slovastick
									.append(element);
							})

						s.opt.console.val("");
						s.lib.audio.playSignal("yellow");
					}
					else {
						result = s.lib.ele(s.opt.slovastick)
							.key("see", val)
							.run()

						if (!result)
							return s.err("I stop there...");

						s.lib.designate(result, true);

						return s.ok("I go");
					}

					// save to history
					//
				}
			});

		s.opt.console.add(s.opt.result)
			.on("focus.slovastick", function(event){
				s.opt.result.text(s.opt.result.data("last"))
			})
			.on("blur.slovastick", function(event){
				s.opt.result.data("last", s.opt.result.text())
				s.opt.result.text("")
			});

		$(window)
			.on("keydown.slovastick", function(event) {
				var result = s.lib.button.keydown(event);

				if (!result)
					return;
				
				if (s.lib.button.has(["up", "down"])) {
					if (s.opt.console.data("focused"))
						s.opt.console.blur();
					else
						s.opt.console.focus();
				}
				else if (s.lib.button.has(["up"], ["down"], ["left"], ["right"])) {
					if (s.opt.console.data("focused")) {
						if (s.lib.button.has(["up"], ["down"]))
							event.preventDefault();

						return;
					}

					$(window)
						.on("keyup.slovastick-move", function(event) {
							s.lib.move(s.lib.button.last.keydown);
						})
						.on("keydown.slovastick-move keyup.slovastick-move", function(event) {
							$(this)
								.off(".slovastick-move");
						});
				}
				else if (s.lib.button.has(["shift", "control"])) {
					var allInBody 	= $("*", "body"),
						timeout 	= setTimeout(function() {
							if (s.opt.console.data("focused"))
								s.opt.console.blur()
							else
								s.opt.console.focus();
						}, 1000);

					allInBody
						.on("mouseover.slovastick-mouseover", function(event) {
							event.stopPropagation();
							clearTimeout(timeout);

							var that 	= $(this),
								xpath 	= s.lib.xpath(that);

							if (s.opt.console === xpath || "/slovastick" === xpath.slice(-11)) 
								return;

							s.lib.designate(that);
							s.opt.console.val(xpath);
							s.ok("I'am on element")
						});

					$(window)
						.on("keydown.slovastick-mouseover keyup.slovastick-mouseover", function() {
							$(window).add(allInBody)
								.off(".slovastick-mouseover");

							clearTimeout(timeout);
						});
				}
				else if (s.lib.button.has(["shift"], ["control"])) {
					var timeout = setTimeout(function () {
						timeout = false;
					}, 500);

					var isShift = s.lib.button.shift;

					$(window)
						.on("keyup.slovastick-move", function(event) {
							if (timeout)
								s.lib.move(isShift ? "up"   : "down");
							else
								s.lib.move(isShift ? "left" : "right");
						})
						.on("keydown.slovastick-move keyup.slovastick-move", function(event) {
							$(this).add(allInBody)
								.off(".slovastick-move");

							clearTimeout(timeout);
						});
				}
			})
			.on("keyup.slovastick", s.lib.button.keyup);

		s.opt.program.status = "on";
		s.log("I there! Hello :>");
	};
	//
	s["ok"] = function(result) {
		if (s.opt.program.debugMod && window.console && "function" === typeof window.console.log)
			window.console.log("[SLOVASTICK]  ok: ", Array.prototype.slice.call(arguments));

		s.lib.audio.playSignal("green");

		return true;
	};
	//
	s["log"] = function () {
		if (s.opt.program.debugMod && window.console && "function" === typeof window.console.error)
			window.console.error("[SLOVASTICK] log: ", Array.prototype.slice.call(arguments));

		s.lib.audio.playSignal("yellow");

		return null;
	};
	//
	s["err"] = function () {
		if (s.opt.program.debugMod && window.console && "function" === typeof window.console.error)
			window.console.error("[SLOVASTICK] err: ", Array.prototype.slice.call(arguments));

		s.lib.audio.playSignal("red");

		return null;
	};
	// run actions on elements. That's main function
	s["run"] = function(masEle) {
		if (!masEle)
			masEle = [s.lib.ele(s.opt.slovastick)];

		var masEle = $.isArray(masEle) ? masEle : [masEle];

		for (var intEleInd = 0; intEleInd < masEle.length; intEleInd++) {
			if (!masEle[intEleInd])
				return null;

			for (var intAttInd = 0; intAttInd < masEle[intEleInd].key().length; intAttInd++) {
				var attrib = masEle[intEleInd].key()[intAttInd];

				if (!$.isFunction(masEle[intEleInd][attrib.name]))
					continue;

				// delete try-catch for debug
				try {
					var result = masEle[intEleInd][attrib.name]();

					if (null === result)
						return null;

					// if ("function" === typeof result) 
						// result()

					if ($.isArray(result)) {
						if (!result.length)
							return null;
						
						var masLeft  = masEle.slice(0, intEleInd - 1),
							masRight = masEle.slice(intEleInd + 1);

						masEle = masLeft.concat(result).concat(masRight);
						intEleInd--;

						break;
					}
				}
				catch (exeption) {
					if (!attrib["try"]) {
						s.err("when run s." + attrib.name + " with " + attrib.value, exeption, 
							masEle[intEleInd], masEle[intEleInd].key());

						return null;
					}
				}
			}
		}

		return masEle;
	};
	//
	s["try"] = function(ele) {
		if ("*" === ele.key("try").value) {
			$.each(ele.key.memory, function(i, attrib) {
				attrib["try"] = "yes";
			})
		}
	};
	// go recursive through elements and collect their s-attributes
	// !!!can't protect loop calling!!!
	s["see"] = function(ele) {
		if (!ele.key("see").value)
			return [];

		var resultMasEle 	= [],
			masEleContexts 	= [window.document];
		
		if (ele.key("see-context").value) {
			masEleContexts 	= s.lib.xpath(ele.key("see-context").value, ele);

			if (!masEleContexts.length)
				return [];

			masEleContexts 	= s.lib.ele(masEleContexts[0]).see();
		}
		else if ( !(/^[\s\(]*\//.test(ele.key("see").value)) ) {
			masEleContexts 	= [ele];
		}

		var elements = s.lib.xpath(ele.key("see").value, masEleContexts);

		for (var i = 0; i < elements.length; i++) {
			var ele2 		= s.lib.ele(elements[i]),
				masEle 		= ele2.key("see").value ? ele2.see() : [ele2];

			if (!masEle.length && !ele.key("try").value)
				return [];

			for (var j = 0; j < masEle.length; j++) {
				masEle[j].key(ele.key().slice(ele.key("see").index + 1));
			}

			resultMasEle 	= resultMasEle.concat(masEle);
		}

		if (ele.key("see-position").value) {
			var element 	= resultMasEle[parseInt(ele.key("see-position").value) - 1];
			resultMasEle 	= element ? [element] : [];	
		}
		
		return resultMasEle;
	};
	// go to url or element and change console value
	s["go"] = function(ele) {
		if (!ele) {
			var pages 	= s.lib.xpath("//slovastick//*[@s-go]"),
				href  	= window.document.location.href,
				isNoEle = true;

			$.each(pages, function(index, page){
				var url 	= page.attr("s-go"),
					route 	= page.attr("s-go-route");

				if (route && (url === href.slice(0, url.length))) {
					s.opt.console.val(s.lib.xpath(page));

					return isNoEle = false;
				}
			})

			return !isNoEle;
		}
		//
		var url 	= ele.key("go").value;
		// go to element
		if ( !(/^[A-Za-z]+:\/\//.test(url)) ) {
			s.opt.console.val(url);
			s.lib.button.keyup().keydown("enter");
			s.opt.console.keydown();

			return;
		}
		// go to url
		var	route 	= ele.key("go-route").value,
			equal 	= (window.document.location.href.slice(0, url.length) === url),
			pname 	= window.document.location.pathname,
			path 	= ("/" === pname[0]) ? pname.slice(1) : pname;

		if (!equal || !((new RegExp(route)).test(path)))
			window.document.location.href = url;
	};
	// value setting to element
	s["value"] = function(ele) {
		$(ele[0]).val(ele.key("value").value);
	};
	// click on element
	s["click"] = function(ele) {
		$(ele[0]).click();
	};
	// title setting to element
	s["title"] = function(ele) {
		$(ele[0]).attr("title", ele.key("title").value);
	};
	// 
	s["null"] = function(ele) {
		return null;
	};
	// 
	// 	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-
	//
	function check(param) {
		var blocks = ["before", "require", "after"];

		for (i in blocks) {
			var block = blocks[i];

			if (!check[block])
				check[block] = [];

			if (param && param[block] && param[block][0])
				check[block] = check[block].concat(param[block]);
		}

		while (check.before && check.before[0]) {
			check.before.shift()();
		}

		if (check.require && check.require[0])
			return check.require.shift()();

		while (check.after && check.after[0]) {
			check.after.shift()();
		}
	};
	
	check({require: [
		// 
		function() {
			if (!$ || ("2.0.2" !== ($.fn && $.fn.jquery))) {
				var scripts = window.document.getElementsByTagName("script");

				for (var i in scripts) {
					if (!scripts[i].getAttribute)
						continue;

					var attSrc = scripts[i].getAttribute("src");

					if (!attSrc)
						continue;
					
					var masScript = attSrc.match(/^(.*)slovastick\.js/);

					if (masScript) {
						if (!s.opt.program.programSrc)
							s.opt.program.programSrc = masScript[1];

						var script 		= window.document.createElement("script");

						script.onload 	= function() {
							$ = window.jQuery.noConflict(true);
							check();
						}

						script.src 		= encodeURI(s.opt.program.programSrc + "lib/jquery-2.0.2.min.js");

						return window.document.getElementsByTagName('head')[0].appendChild(script);
					}
				}

				return s.err("can't load jQuery");
			}

			check();
		},
		//
		function() {
			s.$ = $;
			// code copied from http://code.jquery.com/jquery-migrate-1.0.0.js 
			// and modified 
			var ua 		= navigator.userAgent.toLowerCase(),
				match 	= (/(chrome)[ \/]([\w.]+)/.exec(ua) 
					|| /(webkit)[ \/]([\w.]+)/.exec(ua)
					|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
					|| /(msie) ([\w.]+)/.exec(ua)
					|| ((ua.indexOf("compatible") < 0) && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua))
					|| []);
			// 
			s.opt.browser = {
				"name" 		: (match[1] || ""),
				"version" 	: (match[2] || "0")
			}
			// on document loaded
			$(check);
		},
		// 
		function() {
			var scripts = $("script[src*='slovastick.js']"),
				match  	= scripts.last().attr("src").match(/^(.*)slovastick\.js\??(.*)$/),
				href 	= match[1],
				search 	= match[2].split("#")[0];

			scripts.not(scripts.last()).remove();

			if (!s.opt.program.programSrc)
				s.opt.program.programSrc = href;

			if (!s.opt.program.pluginSrc)
				s.opt.program.pluginSrc = href + "plugin/";

			if (!s.opt.program.soundSrc)
				s.opt.program.soundSrc = href + "sound/";
			// work with debug-script source
			if (s.opt.program.debugMod 
				&& s.opt.program.debugSrc 
				&& (s.opt.program.debugSrc !== window.document.location.href)
				&& (s.opt.program.debugSrc !== href)) {

				var script = $("<script>")
					.attr("src", encodeURI(s.opt.program.debugSrc + "slovastick.js#" + (new Date()).getTime()));

				$("head")
					.append(script);

				return;
			}
			//
			try {
				var extend 	= $.parseJSON(decodeURI(search));
				$.extend(s, extend);
			}
			catch (e) {}

			if ("msie" === s.opt.browser.name)
				return $.getScript("http://wicked-good-xpath.googlecode.com/files/wgxpath.install.js")
					.success(function() {
						window.wgxpath.install();
						check();
					})

			check();
		},
		//
		function() {
			s.opt.slovastick = $("slovastick:eq(0)");

			if (!s.opt.slovastick.length)
				s.opt.slovastick = $("<slovastick>").prependTo("body");

			s.opt.slovastick.attr("title", "slovastick root element")
			s.lib.plugin(s.opt.program.pluginSrc + "main.xml", check);
		},
		function() {
			var host = window.document.location.hostname;

			if ("www." === host.slice(0, 4))
				host = host.slice(4);
			//
			s.lib.plugin(s.opt.program.pluginSrc + host + ".xml", check);
		},
		function() {
			// fix browser bug or jQuery - http://bugs.jquery.com/ticket/13465
			if (-1 !== $.inArray(s.opt.browser.name, ["mozilla", "msie"])) {
				function recursiveFix(element) {
					$(element).children().each(function() {
						var att = (this.attributes || []);
						
						for (var i = 1; i <= att.length; i++) {
							var name  = att[att.length - i].name,
								value = att[att.length - i].value;

							$(this).removeAttr(name);
							$(this).attr(name, value);
						}

						recursiveFix(this);
					})
				};
			
				recursiveFix(s.opt.slovastick);
			}
			// 
			check();
		}
	], after: [s]});
}((window.slovastick && window.slovastick.$) || window.jQuery))