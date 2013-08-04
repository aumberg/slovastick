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
			name 		: "slovastick"
			,description: "slovastick - web-based DOM manipulator"
			,version 	: "0.1"
			,debugMod	: false //false || true || "all"
			,status		: "off"
			,debugSrc 	: "http://localhost/"
			,programSrc	: ""
			,pluginSrc	: ""
			,soundSrc	: ""
		}
		,user: {
			language	: "en"
			,sound: {
				volume	: 75
			}
		}
		,current: {
			element 	: undefined
		}
		,browser: (function() {
			// code copied from http://code.jquery.com/jquery-migrate-1.0.0.js 
			// and modified 
			var ua 		= navigator.userAgent.toLowerCase(),
				match 	= (/(chrome)[ \/]([\w.]+)/.exec(ua) 
					|| /(webkit)[ \/]([\w.]+)/.exec(ua)
					|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
					|| /(msie) ([\w.]+)/.exec(ua)
					|| ((ua.indexOf("compatible") < 0) && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua))
					|| []);

			// var audio = window.document.createElement("audio");

			var audioExt;
			var audio = window.document.createElement("audio")

			if (audio && audio.canPlayType) {
				if (audio.canPlayType("audio/mpeg"))
					audioExt = ".mp3";
				else if (audio.canPlayType("audio/ogg"))
					audioExt = ".ogg";
			}
			
			return {
				"name" 		: (match[1] || "")
				,"version" 	: (match[2] || "0")
				,"audioExt" : audioExt
			}
		}())
	};
	//
	s.lib = {
		//
		audio: {
			"signal-play": (function() {
				var audio = window.document.createElement("audio");

				if (!s.opt.browser.audioExt)
					return function() {};

				return function(strSignalName) {
					if (!s.opt.user.sound.volume)
						return;

					audio.volume = s.opt.user.sound.volume / 100;
					audio.pause();
					audio.src = s.opt.program.soundSrc + strSignalName + s.opt.browser.audioExt;
					audio.play();
				}
			}())
			,"speech-play": function() {}
		}
		// button events checker
		,button: (function() {
			var b = {
				name: {
					"enter"		: 13
					,"shift" 	: 16
					,"control" 	: 17
					,"alt" 		: 18
					,"left" 	: 37
					,"up" 		: 38
					,"right" 	: 39
					,"down" 	: 40
				}
				// last pressed buttons
				,last: {}
				// count of pressed buttons
				,"count": function() {
					result = 0;

					$.each(b.name, function(buttonName) {
						if (b[buttonName])
							result++;
					})

					return result;
				}
				//
				,"keycode": function(buttonName) {
					var result = false;

					$.each(b.name, function(name, code){
						if (buttonName === code) {
							result = name;

							return false;
						}
					})

					return result;
				}
				// 'keydown' event catch
				,"keydown": function(param) {
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
				}
				// 'keyup' event catch
				,"keyup": function(param) {
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
				}
				// test pushed buttons
				// arguments: (["control"], ["shift"]) 	- control OR shift
				// arguments: (["control", "shift"]) 	- control AND shift
				,"has": function() {
					for (var i = 0; i < arguments.length; i++) {
						var masHas = [],
							isOk = true;

						if (!$.isArray(arguments[i]))
							s.err("bad arg for 'has' function", arguments[i]);

						for (var j = 0; j < arguments[i].length; j++) {
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
		}())
		// all avaliable commands for slovastick element
		,"allEleCommand": function() {
			var clone = $.extend({}, s);

			delete clone["$"];
			delete clone["opt"];
			delete clone["lib"];

			var result = {
				"obj" 	: clone
				,"mas" 	: []
				,"str"	: ""
			};

			$.each(clone, function(name, value) {
				result.mas.push(name);
			});

			result.str = result.mas.join(" ");

			return result;
		}
		// create slovastick element with dynamically changeable object of s-attributes
		// all elements must be found in DOM by one string selector  
		,"ele": function(ele) {
			ele = $(ele || s.opt.slovastick);
			s.lib.keychain(ele);
			ele.and = {};

			$.each(s.lib.allEleCommand().obj, function(strKey, objValue) {
				ele[strKey] = function () {
					return s[strKey](ele);
				};

				ele.and[strKey] = function () {
					ele[strKey]();

					return ele;
				};
			});

			var realAttributes = (ele[0].attributes || []);

			$.each(realAttributes, function(index, attrib) {
				if (attrib.name && "s-" === attrib.name.slice(0, 2))
					ele.key(attrib.name.slice(2), attrib.value);
			})
			
			return ele;
		}
		// eleEle - dusha v tele :S
		,"eleEle": function(mas) {
			var result = {
				"length" : mas.length
			};

			s.lib.keychain(result);

			for (var i = 0; i < mas.length; i++) {
				result[i] = s.lib.ele(mas[i]);
			}

			$.each(s.lib.allEleCommand().obj, function(strKey) {
				result[strKey] = function () {
					for (var i = 0; i < result.length; i++) {
						result[i].key(result.key())[strKey]();
					}

					return result;
				};
			})

			return result;
		}
		// search element by xpath or cssPath selector
		,"find": function(param, contexts) {
			if ("string" === typeof param) {
				var result = s.lib["find-by-xpath"](param, contexts);

				if (!result || !result.length)
					result = s.lib["find-by-css"](param, contexts);

				return result && result.length ? result : [];
			}

			if ("object" !== typeof param)
				return;

			var result = {
				"css"	: ""
				,"xpath": ""
			};

			for (var element = $(param)[0]; element && (1 === element.nodeType); element = element.parentNode) {
				if (element.id) {
					result["css"] 	= " #" 		 + element.id 		 + result["css"];
					result["xpath"] = "/*[@id='" + element.id + "']" + result["xpath"];

					break;
				}

				var position = 1;

				for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
					if (10 === sibling.nodeType)
						continue;
					else if (sibling.nodeName == element.nodeName)
						position++;
				}

				if (1 === position) {
					position = 0;

					for (var sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
						if (10 === sibling.nodeType)
							continue;
						else if (sibling.nodeName == element.nodeName) {
							position = 1;

							break;
						}
					}
				}

				var tagName = element.nodeName.toLowerCase();

				if (position) {
					result["css"] 	= " " + tagName +":eq(" + (position - 1) + ")" + result["css"];
					result["xpath"] = "/" + tagName +   "[" + position 		 + "]" + result["xpath"];	
				}
				else {
					result["css"] 	= " " + tagName + result["css"];
					result["xpath"] = "/" + tagName + result["xpath"];	
				}
			}

			if (!result.css)
				return {};

			result["css"] 	= 		result["css"].slice(1);
			result["xpath"] = "/" + result["xpath"];

			return result;
		}
		// css-path search in document
		,"find-by-css": function(param, contexts) {
 			if ("object" === typeof param)
				return s.lib.find(param)["css"];
			else if ("string" !== typeof param)
				return;

			try {
				return $(param, contexts);
			}
			catch (e) {}
		}
		// xpath search in document
		,"find-by-xpath": function(param, contexts) {
 			if ("object" === typeof param)
				return s.lib.find(param)["xpath"];
			else if ("string" !== typeof param)
				return;

			var masElements = [],
				masElementsContext = [],
				strXPath = param;

			if (!strXPath)
				strXPath = ".";
			else if ("/" === strXPath[0])
				strXPath = "." + strXPath;

			if (contexts)
				masElementsContext = $.isArray(contexts) ? contexts : [contexts];
			else
				masElementsContext = [window.document];
				
			for (var i = 0; i < masElementsContext.length; i++) {
				var c = $(masElementsContext[i])[0];

				try {
					xpath = window.document.evaluate(strXPath, c, null, 0, null);
				}
				catch (e) {
					return;
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
		// function for list-manipulating object data
		,"keychain": function(obj) {
			obj["key"] = function(param, param2) {
				if (null === param) {
					// remove all keys
					if (undefined === param2) {
						obj.key.chain = [];

						return obj;
					}
				}
				else if (undefined === param) {
					// get all keys
					if (undefined === param2)
						return [].concat(obj.key.chain);
				}
				// 
				else if ("string" === typeof param) {
					// remove key
					if (null === param2) {
						var list = [];

						for (var i = 0; i < obj.key.chain.length; i++) {
							if (param !== obj.key.chain[i].name)
								list.push(obj.key.chain[i]);
						}

						obj.key.chain = list;

						return obj;
					}
					// find key
					else if (undefined === param2) {
						for (var i = 0; i < obj.key.chain.length; i++) {
							if (param === obj.key.chain[i].name)
								return $.extend({}, obj.key.chain[i], {"index": i});
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
						$.each(param, function(index, key) {
							if ("object" !== typeof key)
								throw ["keychain: bad first argument", arguments];

							obj.key(key);
						})

						return obj;
					}
				}
				//
				else if ("object" === typeof param) {
					// set key
					if (undefined === param2) {
						if ("string" !== typeof param.name)
							throw ["keychain: can't set value", arguments];

						obj.key(param.name, null);
						obj.key.chain.push(param);

						return obj;
					}
				}

				throw ["keychain: bad arguments ", param, param2, " in ", obj];
			}

			return obj.key(null);
		}
		// 
		,"plugin": function(strPath, callback) {
			function parse(index, element) {
				if (!element.tagName || "#" === element.nodeName[0])
					return;

				s.opt.slovastick.children(element.tagName)
					.remove();

				s.opt.slovastick
					.append(element);
			}

			$.ajax(strPath, {
				dataType: 'text',
				cache: false,
				success: function(data) {
					try {
						var elements = $($.parseHTML(data, false)); //keepScripts = true
						elements.each(parse);
						s.ok("I loaded plugin");

						if ("function" === typeof callback)
							callback();
					}
					catch (e) {
						s.err("I can't find correct plugin for that site", e);
					}
				}
				,error: function() {
					if ("function" === typeof callback)
						callback();
				}
			});
		}
		//slice string for parts. It need for service "google translate"
		,"text-slice": function(str, sliceNum) {
			if(!sliceNum || "number" !== typeof sliceNum)
				return;

			sliceNum = sliceNum || 90;
			str = $.trim(str).replace(/(\s)+/, " ");
			var result = [];

			function loop()
			{
				if(!str.length)
					return;

				var part = str.slice(0, sliceNum);

				if(sliceNum > part.length)
					return result.push(part);

				var search = /[\.\?\!][^\.\?\!]*$/.exec(part),
					nextStartIndex = sliceNum;

				if(search)
					nextStartIndex = sliceNum - (search[0].length - 1);
				else if(-1 !== part.lastIndexOf(" "))
					nextStartIndex = part.lastIndexOf(" ") + 1;

				result.push(str.slice(0, nextStartIndex));
				str = str.slice(nextStartIndex);
		
				loop();
			}

			loop();

			return result;
		}
	};
	//
	s["off"] = function (ele) {
		$(window).add($("*", "body"))
			.off(".slovastick .slovastick-console .slovastick-move .slovastick-mouseover");
		
		if (s.opt.panel)
			s.opt.panel.css("display", "none");

		s.opt.program.status = "off";
	};
	//
	s["on"] = function (ele) {
		s["off"]();

		s.opt.panel 			= $("#slovastick_panel", 	s.opt.slovastick)
			.attr("title", s.opt.program.description 
				+ " (version " + s.opt.program.version + ") "
				+ "Press Up + Down arrows for change focus.")
			.css("display", "block");

		if (!s.opt.panel)
			return null;

		s.opt.button 			= $("[name='button']", 		s.opt.panel);

		s.opt.button.program 	= $("[name='program']", 	s.opt.button)
			.html("&nbsp;<b>SLOVASTICK</b>&nbsp;" + s.opt.program.version + "&nbsp;");

		s.opt.console 			= $("[name='console']", 	s.opt.panel)
			.css("width", s.opt.panel.width());

		s.opt.button.mode 		= $("[name='mode']", 		s.opt.button)
			.on("change", function() {
				var mode = $(this).find(":selected").val().toLowerCase();

				s.opt.console
					.val("")
					.off()
					.on("focus", function() {
						s.log("I'am on console");
					});

				s["after-set-current-element"] = function(ele) {};

				if ("command" === mode) {
					// http://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/
					if ('webkitSpeechRecognition' in window) {
						var recognition = new webkitSpeechRecognition();

						recognition.lang = s.opt.user.language;
						recognition.continuous = true;
						recognition.interimResults = false;

						recognition.onerror = function(event) {
							s.err("recognition - " + event.error);
						};

						recognition.onresult = function(event) {
							var interim_transcript = "";

							for (var i = event.resultIndex; i < event.results.length; ++i) {
								var str = event.results[i][0].transcript;

								if (event.results[i].isFinal) {
									s.opt.console.val(str);
									s.opt.current.ele.key("run", str).run();
								}
							}
						};

						recognition.start();

						$(this).one("change", function(){
							recognition.stop();
							delete recognition;
						})
					}

					// run command
					s.opt.console
						.on("blur", function() {
							var val = s.opt.console.val();
							// is XML ?
							if (/^\s*</.test(val)) {
								var ele = s.lib.ele($($.parseHTML(val, true))) //keepScripts = true
								ele.run();

								return s.lib.audio["signal-play"]("yellow");
							}
							//is command
							s.opt.current.ele.key("run", val).run();
						})
				}
				else if ("info" === mode) {
					s["after-set-current-element"] = function(ele) {
						var clone 	= $(ele).clone()
							,organs = clone.children().remove()
							,text 	= clone.text().replace(/\s+/g, " ")
							,found 	= s.lib.find(ele)
							;

						clone.remove();

						s.opt.console.val(
							  "-------text-------\r\n" 		+ text
							+ "\r\n-------xpath------\r\n"	+ found["xpath"] 
							+ "\r\n-------css--------\r\n"  + found["css"]);
					}

					s.opt.current.ele["after-set-current-element"]();

					setTimeout(function() {
						var allInBody = $("*", "body").not($("*", s.opt.panel).andSelf());

						allInBody.on("mouseover.slovastick-mouseover", function(event) {
							event.stopPropagation();
							s.lib.ele(this).key("designate-no-scroll", "")["designate"]()["set-current-element"]();
						});

						$(window)
							.on("keydown.slovastick-mouseover keyup.slovastick-mouseover mousedown.slovastick-mouseover click.slovastick-mouseover", function() {
							$(this).add(allInBody)
								.off(".slovastick-mouseover");
						});
					}, 500);
				}
			})
			.change();

		s.opt.button.language 	= $("[name='language']", 	s.opt.button)
			.on("change", function() {
				var language = $(this).find(":selected").val().toLowerCase();

				langCode = {
					"english"	: "en"
					,"russian"	: "ru"
				}

				s.opt.user.language = langCode[language];
			});

		s.opt.button.sound 		= $("[name='sound']", 		s.opt.button)
			.on("change", function() {
				s.opt.user.sound.volume = parseInt($(this).find(":selected").val().slice(6));
			});

		s.opt.button.kick 		= $("[name='kick']", 		s.opt.button)
			.on("click", function() {
				if ("10px" === s.opt.panel.css("right"))
					s.opt.panel.css({"left":"10px", "right":"auto"});
				else
					s.opt.panel.css({"left":"auto", "right":"10px"});
			});

		$(window)
			.on("resize", function() {
				s.opt.console.css("max-width", 	($(window).width()  - 40) + "px");
				s.opt.console.css("max-height",	($(window).height() - 90) + "px");
			})
			.resize()
			.on("keydown.slovastick", function(event) {
				var result = s.lib.button.keydown(event);

				if (!result)
					return;
				
				if (s.lib.button.has(["up", "down"])) {
					if (s.opt.console.is(":focus"))
						s.opt.console.blur();
					else
						s.opt.console.focus();
				}
				else if (s.lib.button.has(["up"], ["down"], ["left"], ["right"])) {
					if (s.opt.console.is(":focus")) {
						if (s.lib.button.has(["up"], ["down"]))
							event.preventDefault();

						return;
					}
					$(window)
						.on("keyup.slovastick-move", function(event) {
							s.opt.current.ele.key("move", s.lib.button.last.keydown)["move"]();
						})
						.on("keydown.slovastick-move keyup.slovastick-move", function(event) {
							$(this)
								.off(".slovastick-move");
						});
				}
				else if (s.lib.button.has(["shift", "control"])) {
					var timeout = setTimeout(function() {
						if (s.opt.console.is(":focus"))
							s.opt.console.blur()
						else
							s.opt.console.focus();
					}, 1000);

					$(window)
						.on("keydown.slovastick-mouseover keyup.slovastick-mouseover", function() {
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
								s.opt.current.ele.key("move", isShift ? "up"  	: "down" )["move"]();
							else
								s.opt.current.ele.key("move", isShift ? "left" 	: "right")["move"]();
						})
						.on("keydown.slovastick-move keyup.slovastick-move", function(event) {
							$(this)
								.off(".slovastick-move");

							clearTimeout(timeout);
						});
				}
			})
			.on("keyup.slovastick", s.lib.button.keyup);


		ele = s.go();

		if (ele)
			ele.run();			

		s.opt.program.status = "on";
		s.log("I there! Hello :>");

		return ele;
	};
	//
	s["ok"] = function(result) {
		if (s.opt.program.debugMod && window.console && "function" === typeof window.console.log)
			window.console.log("[SLOVASTICK]  ok: ", arguments);

		s.lib.audio["signal-play"]("green");

		return true;
	};
	//
	s["log"] = function () {
		if (s.opt.program.debugMod && window.console && "function" === typeof window.console.error)
			window.console.error("[SLOVASTICK] log: ", arguments);

		s.lib.audio["signal-play"]("yellow");

		return null;
	};
	//
	s["err"] = function () {
		if (s.opt.program.debugMod && window.console && "function" === typeof window.console.error)
			window.console.error("[SLOVASTICK] err: ", arguments);

		s.lib.audio["signal-play"]("red");

		return null;
	};
	// run actions on elements. That's main function
	s["run"] = function(ele) {
		var masEle = [(ele || s.lib.ele())];

		for (var intEleInd = 0; intEleInd < masEle.length; intEleInd++) {
			if (!masEle[intEleInd])
				return null;

			for (var intAttInd = 0; intAttInd < masEle[intEleInd].key().length; intAttInd++) {
				ele = masEle[intEleInd];

				var attrib = ele.key()[intAttInd];

				if (!$.isFunction(ele[attrib.name]))
					continue;

				// delete try-catch for debug
				try {
					// run call run - recursion
					if ("run" === attrib.name) {
						var masRun 	= attrib.value.split(" ")
							,masCmd = []
							,strCmd = ""
							,i 		= 0
							,allCmd = " " + s.lib.allEleCommand().str
							;

						for (i; i < masRun.length; i++) {
							if (!masRun[i])
								continue;

							masCmd.push(masRun[i].toLowerCase());
							strCmd = masCmd.join("-");

							if (-1 === allCmd.indexOf(" " + strCmd)) {
								masCmd.pop();

								break;
							}

							if ("function" === typeof s[strCmd])
								break;						
						}

						if (!strCmd || ("function" !== typeof s[strCmd])) {
							s.err("that's not fun-ny");

							continue;
						}

						s.lib.ele(ele).key(strCmd, $.trim(masRun.slice(i + 1).join(" ")))[strCmd]();

						continue;
					}
					//

					var result = ele[attrib.name]();

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
							ele, ele.key());

						return null;
					}
				}
			}
		}

		return s.lib["eleEle"](masEle);
	};
	//
	s["try"] = function(ele) {
		if ("*" === ele.key("try").value) {
			$.each(ele.key.chain, function(i, attrib) {
				attrib["try"] = "yes";
			})
		}
	};
	// go recursive through elements and collect their s-attributes
	// !!!can't protect loop calling!!!
	s["see"] = function(ele) {
		var result 			= []
			,masEleContexts = [window.document]
			,try_ 			= ele.key("try").value
			,see 			= ele.key("see").value
			,seeIndex 		= ele.key("see").index
			// filtration by element's position in result massive
			,position 		= ele.key("see-position").value
			// context of search
			,context 		= ele.key("see-context").value
			// 
			;

		if (!see)
			return null;

		if (context) {
			masEleContexts 	= s.lib["find-by-xpath"](context, ele);

			if (!masEleContexts.length)
				return null;

			masEleContexts 	= s.lib.ele(masEleContexts[0]).see();
		}
		else if ( !(/^[\s\(]*\//.test(see)) ) {
			masEleContexts 	= [ele];
		}

		var elements = s.lib["find"](see, masEleContexts);

		if (position)
			elements = [elements[position - 1]];

		if (!elements[0])
			return null;

		for (var i = 0; i < elements.length; i++) {
			var ele2 		= s.lib.ele(elements[i]),
				masEle 		= ele2.key("see").value ? ele2.see() : [ele2];

			masEle = (masEle || []);

			if (!masEle.length && !try_)
				return null;

			for (var j = 0; j < masEle.length; j++) {
				var x = ele.key().slice(seeIndex + 1)
				masEle[j].key(ele.key().slice(seeIndex + 1));
			}

			result 	= result.concat(masEle);
		}
		// !!! s.lib["eleEle"](result);
		return result 
	};
	// move to sibling element
	s["move"] = function(ele) {
		var direction 	= ele.key("move").value
			,xpath  	= s.lib.find(ele).xpath
			;

		if (-1 === $.inArray(direction, ["left", "right", "up", "down"]))
			return s.err("I stop there...");

		var isUpOrDown	= (-1 !== $.inArray(direction, ["up", "down"]))
			,position 	= parseInt(ele.key("see-position").value)
			,direct 	= {
				up 		: "/preceding-sibling::*"
				,down 	: "/following-sibling::*"
				,left 	: "/ancestor::*"
				,right 	: "/child::*"
			};

		// change attribute s-see-position
		if (position && isUpOrDown) {
			var	newPosition 	= ("up" === direction) ? position - 1 : position + 1
				,all 			= ele.key("see-position", null).see()
				;

			if (!all || !all[newPosition - 1]) {
				newPosition = (all && all.length && (1 < newPosition))  ? (all.length).toString() : "1";
				$(ele.key("see-position", newPosition)[0]).attr("s-see-position", newPosition);
			}
			else {
				newPosition = newPosition.toString();
				var eleEle = s.lib.ele(ele[0]).key("see-position", newPosition).run();

				if (eleEle) {
					$(ele.key("see-position", newPosition)[0]).attr("s-see-position", newPosition);
					s.ok("I move " + direction);
					eleEle["designate"]();

					return ele;
				}
			}
		}
		// find currect elements
		var masSiblings = s.lib["find-by-xpath"](xpath + direct[direction]);

		if (-1 !== $.inArray(s.opt.browser.name, ["mozilla", "msie"]) 
			&& ("left" === direction || "up" === direction))
				masSiblings.reverse();

		for (var i 	= 0; i < masSiblings.length; i++) {
			var ele = s.lib.ele(masSiblings[i]);

			if (ele.key("see").value && ele.key("see-position").value && !ele.see()) {
				$(ele.key("see-position", "1")[0]).attr("s-see-position", "1");
			}

			var oldCurrent 	= s.opt.current.ele
				,eleEle 	= ele["set-current-element"]().run()
				;

			if (eleEle) {
				s.ok("I move " + direction);
				eleEle["designate"]();
		
				return ele;
			}

			s.opt.current.ele = oldCurrent;
		}

		return s.err("I stop there...");		
	};
	// go to url or element and change current element value
	s["go"] = function(ele) {
		var href  		= window.document.location.href
			,path 		= ele && ele.key("go").value
			,goRoute 	= ele && ele.key("go-route").value
			;

		if (!ele) {
			var isNoEle = true;

			$.each(s.lib["find-by-xpath"]("//slovastick//*[@s-go]"), function(index, page) {
				var url = page.attr("s-go");

				if (page.attr("s-go-route") && (url === href.slice(0, url.length))) {
					s.lib.ele(page)["set-current-element"]();

					return isNoEle = false;
				}
			})

			if (isNoEle)
				return null;

			return s.opt.current.ele;
		}
		// go to element
		if ( !(/^[A-Za-z]+:\/\//.test(path)) ) {
			var eleEle 	= s.lib.ele().key("see", path).run();

			if (!eleEle)
				return s.err("I stop there...");

			ele = eleEle[0];

			ele["set-current-element"]()["designate"]();
			s.ok("I go");

			return ele;
		}
		// go to url
		var	equal 	= (href.slice(0, path.length) === path)
			,pname 	= window.document.location.pathname.slice(1)
			;

		if (!equal || !((new RegExp(goRoute)).test(pname)))
			window.document.location.href = path;

		return ele;
	};
	//
	s["designate"] = function(ele) {
		var color 		= (ele.key("designate-color").value || "green")
			,noScroll 	= (undefined !== ele.key("designate-no-scroll").value)
			;

		if (!noScroll) {
			var element = $(ele[0]);

			if (element.is(':visible')) {
				var offset 			= element.offset()
					,scrollTopValue = parseInt(offset ? offset.top : 0) - Math.round($(window).height()/2) + "px"
					;

				$("html, body")
					.stop(true)
					.animate({"scrollTop": scrollTopValue}, {"duration": 300, "easing": "swing"});
			}
		}

		$.each(ele, function(index, element) {
			element 	= $(element);

			var offset 	= element.offset();

			$("<div s-null>")
				.css({
					"position"	: "absolute"
					,"width"	: element.css("width")
					,"height"	: element.css("height")
					,"left"		: offset.left
					,"top"		: offset.top
					,"z-index"	: "2147483647"
					,"background-color": color
				})
				.on("mouseover", function(event) {
					event.preventDefault();
					event.stopPropagation();
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

		$(ele[0]).focus();

		return ele;
	}
	// write result to console
	// s["console"] = function(ele) {
		
	// };
	// eval javascript
	// s["javascript"] = function(ele)
	// {
	// 	var ele = $(ele).clone(),
	// 		organs = ele.children().remove(),
	// 		text = ele.text();

	// 	ele.remove();

	// 	eval(text);

	// 	return;
	// },
	//
	s["set-current-element"] = function(ele) {
		s.opt.current.ele = ele;
		s["after-set-current-element"](ele);

		return ele;
	};
	//
	s["after-set-current-element"] = function(ele) {

	};
	//!!! need RegExp search
	s["find-by-text"] = function(ele) {
		var text = ele.key("find-by-text").value;

		if (/^\s*$/.test(text))
			return s.err("nothing found");

		var mas  = s.lib["find-by-xpath"]("//*[contains(text(), '" + text + "')]");

		if (!mas.length)
			return s.err("nothing found");

		s.lib["eleEle"](mas)["designate"]();

		return ele;
	};
	s["in-english-say"] = function(ele) {
		var text = ele.key("in-english-say").value;
		s.lib.audio["speech-play"](text, "en");

		return ele;
	};
	// 
	s["help"] = function(ele) {
		var cmd = "in english say - Hello, You can speak in microphone for run commands, "
			+ "or press buttons up and down together. "
			+ "Now run command \"move down\"";

		s.opt.console.val(cmd);
		s.lib.ele().key("run", cmd).run();

		return ele;
	};
	//
	s["shortcut"] = function(ele) {
		var shortcut 	= $.trim(ele.key("shortcut").value).replace(/(\s)+/g, "-")
			,res 		= s.lib.ele().key("see", "//e//" + shortcut).run()
			;

		if (!res)
			return null;

		s.lib.eleEle(res)["designate"]();

		return ele;
	};
	// value setting to element
	s["value"] = function(ele) {
		$(ele[0]).val(ele.key("value").value);

		return ele;
	};
	// click on element
	s["click"] = function(ele) {
		var href = $(ele[0]).parents("a").andSelf().filter("[href]:eq(0)").attr("href");
		$(ele[0]).click();

		if (href && !$(ele[0]).attr("onclick"))
			window.document.location.replace(href);

		return ele;
	};
	// title setting to element
	s["title"] = function(ele) {
		$(ele[0]).attr("title", ele.key("title").value);

		return ele;
	};
	// null
	s["null"] = function(ele) {
		return null;
	};
	// 
	// 	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-
	//
	function check(param) {
		var blocks = ["before", "require", "after"];

		for (var i = 0; i < blocks.length; i++) {
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

				for (var i = 0; i < scripts.length; i++) {
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
		}
		//
		,function() {
			s.$ = $;
			// on document loaded
			$(check);
		}
		// 
		,function() {
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
		}
		//
		,function() {
			s.opt.slovastick = $("slovastick:eq(0)");

			if (!s.opt.slovastick.length)
				s.opt.slovastick = $("<slovastick>")
					.attr("id", "slovastick")
					.attr("title", "slovastick's root element")
					.prependTo("body");

			s.opt.current.ele = s.lib.ele();

			s.lib.plugin(s.opt.program.pluginSrc + "hello.xml", check);
		}
		,function() {
			var host = window.document.location.hostname;

			if ("www." === host.slice(0, 4))
				host = host.slice(4);
			//
			s.lib.plugin(s.opt.program.pluginSrc + host + ".xml", check);
		}
		,function() {
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
		// auioplayer for speech
		,function() {
			if (!s.opt.browser.audioExt){
				s.lib.audio["speech-play"] = function() {};
			}
			else {
				var audio;

				$("<iframe name='slovastick_iframe' width='0px' height='0px' s-null=''>")
					.load(function() {
						var body = $(this).contents().find("body");
						// $(this).contents().find("head")
						// .html("<meta http-equiv='Cache-Control' content='public'/>");

						audio = $("<audio>")
							.appendTo(body)
							.get(0);
					})
					.appendTo($("body"));

				s.lib.audio["speech-play"] = function(text, lang) {
					if (!s.opt.user.sound.volume)
						return;

					// google
					if (".mp3" === s.opt.browser.audioExt) {
						var masText = s.lib["text-slice"](text, 90);

						$(audio)
							.off()
							.on("ended", function() {
								text = masText.shift();

								if (!text)
									return;

								text = encodeURIComponent(text);

								var url = "http://translate.google.com/translate_tts?ie=UTF-8&q=" + text + "&tl=" + s.opt.user.language;
								
								audio.volume = s.opt.user.sound.volume / 100;
								audio.pause();
								audio.src = url;
								audio.play();
							})

						$(audio).trigger("ended");
					}
					// not google
					else {
						var local =
						{
							"ru": "&LOCALE=ru&VOICE=voxforge-ru-nsh",
							"en": "&LOCALE=en_US&VOICE=cmu-slt-hsmm"
						};

						var url = "http://mary.dfki.de:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT=" + text + local[s.opt.user.language] + "&AUDIO=WAVE_FILE";

						audio.volume = s.opt.user.sound.volume / 100;
						audio.pause();
						audio.src = url;
						audio.play();
					}					
				}
			}

			check();
		}
	], after: [s]});
}((window.slovastick && window.slovastick.$) || window.jQuery))