// 
// slovastick - web-based DOM manipulator
// manifesto  - http://minifesto.org/
(function($) {
	var s = window.slovastick = function(slovastick) {
		if (!slovastick) {
			var slova = [];

			s.type.element({is:s.current()}).parents().andSelf().each(function(index, element) {
				slova.push(element.tagName);
			});

			slova = slova.join(" ").toLocaleLowerCase();

			var m = slova.match(/\bhello\b.*/i);

			if (m) {
				slova = m[0];
			}

			return slova;
		}

		if ("function" === typeof slovastick) {	
			return s.library.loader(function() {
				a(s);
			});
		}

		if ("string" !== typeof slovastick) {
			return null;
		}

		var words = $.trim(slovastick).split(/[^A-Za-zА-ЯЁа-яё]+/),
			finded
			;

		var slova = function() {
			if (!words.length)
				return;

			var word = words.shift();

			// s.say(word);

			var finded = s.library.find(s.current() + "/child::" + word);

			if(finded.length) {
				s.green(word, finded);

				setTimeout(function() {
					s.go({is:finded});
					slova();
				}, 1000);

				return;
			}

			if(s[word]) {
				s.yellow(word, s[word]);

				setTimeout(function() {
					s[word]();
					slova();
				}, 1000);

				return;
			}

			return s.red(word);
		}

		// for (var i = 0; i < words.length; i++) {
		// 	if(finded.length) {
		// 		var fun = function() {
		// 			s.green(word);
		// 			s.run(finded);

		// 		setTimeout(words, 1000);
		// 	}

		// 	else {
		// 		s.red(word);

		// 		return null;
		// 	}

			
		// };

		slova(words);
	};
	//
	s.slovastick = s;
	//
	s.memory = {
		current: {
			element 		: "//*[@id='slovastick']"
		}
		,go: {
			element 		: undefined
			,position 		: undefined
			,members		: {}
		}
		,loader: {
			queue  			: []
			,history 		: []
		}
		,audio: {
			signal: undefined
			,speech: undefined
		}
	}
	//
	s.option = {
		program: {
			name 			: "Slovastick"
			,description	: "Slovastick - web-based DOM manipulator"
			,version 		: "0.2"
			,status			: "off"
			,debug : {
				mode 		: false //false || true || "all"
				,src 		: "http://localhost/"
			}
			,src : {
				program		: ""
				,plugin		: ""
				,sound		: ""
			}
		}
		,user: {
			language		: "en"
			,go: {
				and: {
					say: {
						text: {
							is: true
						}
					}
					,animate: {
						color: {
							is: "green" 
						}
					}
				}
			}
			,sound: {
				volume		: 75
			}
		}
		,browser: (function() {
			// code copied from http://code.jquery.com/jquery-migrate-1.0.0.js 
			// and modified 
			var ua 		= navigator.userAgent.toLowerCase();
			var	match 	= (/(chrome)[ \/]([\w.]+)/.exec(ua) 
					|| /(webkit)[ \/]([\w.]+)/.exec(ua)
					|| /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
					|| /(msie) ([\w.]+)/.exec(ua)
					|| ((ua.indexOf("compatible") < 0) && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua))
					|| []);
			//
			var audio = window.document.createElement("audio");
			var audio_extension;

			if (audio && audio.canPlayType) {
				if (audio.canPlayType("audio/mpeg"))
					audio_extension = ".mp3";
				else if (audio.canPlayType("audio/ogg"))
					audio_extension = ".ogg";
			}
			
			return {
				name 			: (match[1] || "")
				,version 		: (match[2] || "0")
				,audio: {
					extension 	: audio_extension
				}
			}
		}())
	};
	//
	s.library = {
		//
		regexp: {
			to: {
				string: function(string) {
					return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
				}
			}
		}
		//
		,node: {
			// get code from comment-node
			// can't parse tag "link", because HTML :(
			parse: function(nodes) {
				var result = [];

				nodes = $(nodes);

				for (var i = 0; i < nodes.length; i++) {
					for (var j = 0; j < nodes[i].childNodes.length; j++) {
						var child = nodes[i].childNodes[j];

						if ((child.nodeType !== child.COMMENT_NODE) || !child.data) 
							continue;

						if (child.data.match(/\bslovastick\./)) //  /^\s*slovastick\b([\s\S]*)/
							result.push(child.data);
					};
				}

				return result.join(";");
			}
		},
		//
		audio: {
			play: {
				signal: function(strSignalName) {
					var audio = s.memory.audio.signal;

					if (!s.option.user.sound.volume || !s.option.browser.audio.extension || !audio)
						return;

					audio.volume = s.option.user.sound.volume / 100;
					audio.pause();
					audio.src = s.option.program.src.sound + strSignalName + s.option.browser.audio.extension;
					audio.play();
				}
				,speech: function(text, lang) {
					var audio = s.memory.audio.speech;

					if (!s.option.user.sound.volume || !audio) {
						return;
					}

					text = $.trim(text.replace(/\s+/g, " "));
					var masText = s.library.text.pieces({text:{is:text}, range:{is:90}});

					var listened = 1; 

					function play() {
						listened++;

						text = masText.shift();

						if (!text) {
							return;
						}

						text = encodeURIComponent(text);
						var url = "";

						// google
						if (".mp3" === s.option.browser.audio.extension) {
							url = "http://translate.google.com/translate_tts?ie=UTF-8&q=" + text + "&tl=" + s.option.user.language;
						}
						// not google
						else if (".ogg" === s.option.browser.audio.extension) {
							var local = {
								"ru": "&LOCALE=ru&VOICE=voxforge-ru-nsh",
								"en": "&LOCALE=en_US&VOICE=cmu-slt-hsmm"
							};
							url = "http://mary.dfki.de:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT=" + text + local[s.option.user.language] + "&AUDIO=WAVE_FILE";
						}		

						audio.volume = s.option.user.sound.volume / 100;
						audio.pause();
						audio.src = url;
						audio.play();
					}

					clearTimeout($(audio).data("timeout"));

					$(audio)
						.off()
						.on("timeupdate", function(){
							if (audio.ended) {
								if (listened > 10) {
									listened = 1;

									clearTimeout($(audio).data("timeout"));
									s.yellow("wait");
									$(audio).data("timeout", setTimeout(play, 5000));
								}
								else {
									play();	
								}
							}
						})
						.data("timeout", setTimeout(play, 1000))

					audio.pause();
				}
			}
		}
		//code dependencies loader
		,loader: function(load) {
			if (load) {
				if ("function" === typeof a) {
					s.memory.loader.queue 	= s.memory.loader.queue.concat([a]);
				}
				else {
					load.before 			= (load.before || []);
					load.after 				= (load.after  || []);
					s.memory.loader.queue 	= load.before.concat(s.memory.loader.queue);
					s.memory.loader.queue 	= s.memory.loader.queue.concat(load.after);
				}

				if (s.memory.loader.started) {
					return;
				}
			}

			s.memory.loader.started = true;
			
			if (s.memory.loader.queue.length) {
				var call = {};

				s.memory.loader.history.push(call);
				call.function = s.memory.loader.queue.shift();

				try {
					return call.result = call.function();
				}
				catch(e) {
					s.red(e, "on call last function", call.function.toString(), s.memory.loader.history);
				}
			}

			return s.memory.loader.started = null;
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

					$.each(b.name, function(name, code) {
						if (buttonName === code) {
							result = name;

							return false;
						}
					})

					return result;
				}
				// 'keydown' event catch
				,"keydown": function(event) {
					// a === jquery event
					if ("object" === typeof event)
						var buttonName = b.keycode(event.which);
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
				,"keyup": function(event) {
					// clear all
					if (!event) {
						$.each(b.name, function(buttonName) {
							clearTimeout(b[buttonName]);
							delete b[buttonName];
						})

						delete b.last.keydown;
						delete b.last.keyup;

						return true;
					}
					// a === jquery event
					if ("object" === typeof event)
						var buttonName = b.keycode(event.which);

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
							s.red("bad arg for 'has' function", arguments[i]);

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
		// search element by xpath or cssPath selector
		,find: function(find) {
			find = $.extend(true, {
				is: undefined
				,context: $(document)
			}, find);

			var result;

			find.context = s.type.element({is: find.context});

			// find element by path
			if ("string" === typeof find.is) {
				result = $();

				try {
					return $(find.is, find.context);
				}
				catch (e) {}

				// if can't css try xpath
				for (var i = 0; i < find.context.length; i++) {
					try {
						xpath_result = window.document.evaluate(find.is, find.context[i], null, 0, null);
					}
					catch (e) {
						return null;
					}

					for (var node; xpath_result && (node = xpath_result.iterateNext()); ) {
						result = result.add(node);
					}
				}

				if ("all" === s.option.program.debug.mode) {
					var msg = ["search " + find.is];

					msg = msg.concat(["from contexts", find.context]);

					if (result.length)
						msg = msg.concat(["and found", result]);
					else 
						msg.push("and nothing found!")

					s.yellow.apply(this, msg);
				}

				s.green("result, " , result)

				return result;
			}
			else if ("object" === typeof find.is) {
				result = {
					"css"	: ""
					,"xpath": ""
				};

				$(find.is).each(function(index, element) {
					var css = "", xpath = "";

					for (element; element && (1 === element.nodeType); element = element.parentNode) {
						if (element.id) {
							css 	= " #" 		 + element.id 		 + css;
							xpath 	= "//*[@id='" + element.id + "']" + xpath;

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
							css 	= ":eq(" + (position - 1) + ")" + css;
							xpath 	= "[" 	 + position 	  + "]" + xpath;	
						}
						
						css 	= ">" + tagName + css;
						xpath 	= "/" + tagName + xpath;	
					}

					if (!css)
						return;

					result["css"] 	+= "," + css.slice(1);
					result["xpath"] += "|" + xpath;
				})

				result["css"] 	= result["css"].slice(1);
				result["xpath"] = result["xpath"].slice(1);

				return result;
			}

			return null;
		}
		//slice string for parts. It need for service "google translate"
		,text: {
			self: function(element) {
				element 	= s.type.element({is: element});

				var clone 	= element.clone();
				clone.children().remove();
				
				var result 	= element.val() + clone.text();
				clone.remove();

				return result;
			}
			,pieces: function(pieces) {
				pieces = $.extend(true, {
					text: {
						is 		: ""
					}
					,range: {
						is 		: 1
					}
				}, pieces);

				// if("number" !== typeof pieces.range.is) {
				// 	return null;
				// }

				var result = [];

				(function loop() {
					if(!pieces.text.is.length)
						return;

					var part = pieces.text.is.slice(0, pieces.range.is);

					if(pieces.range.is > part.length)
						return result.push(part);

					var search = /[\.\?\!][^\.\?\!]*$/.exec(part),
						nextStartIndex = pieces.range.is;

					if(search) {
						nextStartIndex = pieces.range.is - (search[0].length - 1);
					}
					else if(-1 !== part.lastIndexOf(" ")) {
						nextStartIndex = part.lastIndexOf(" ") + 1;
					}

					result.push(pieces.text.is.slice(0, nextStartIndex));
					pieces.text.is = pieces.text.is.slice(nextStartIndex);
			
					loop();
				}())

				return result;
			}
			//
			,select: {
				range: function(element, start, end) {
					element = $(element).get(0);

					if (element.setSelectionRange) {
						element.setSelectionRange(start, end);
					} else if (element.createTextRange) {
						var range = element.createTextRange();
						range.collapse(true);
						range.moveStart('character', start);
						range.moveEnd('character', end);
						range.select();
					}
				}
			}
		}
	};
	//
	// 	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-	-
	//
	//
	s.off = function (ele) {
		$(window).add($("*", "body"))
			.off(".slovastick .slovastick-console .slovastick-move .slovastick-mouseover");
		
		if (s.option.panel)
			s.option.panel.css("display", "none");

		s.option.program.status = "off";
	};
	//
	s.on = function (ele) {
		s.off();

		s.option.panel 			= $("#slovastick_panel", 	s.option.slovastick)
			.attr("title", s.option.program.description 
				+ " (version " + s.option.program.version + ") "
				+ "Press Up + Down arrows for change focus.")
			.css("display", "block");

		if (!s.option.panel)
			return null;

		s.option.button 			= $("[name='button']", 		s.option.panel);

		s.option.button.program 	= $("[name='program']", 	s.option.button)
			.html("&nbsp;<b>SLOVASTICK</b>&nbsp;" + s.option.program.version + "&nbsp;");

		s.option.console 			= $("[name='console']", 	s.option.panel)
			.css("width", s.option.panel.width());

		s.option.button.mode 		= $("[name='mode']", 		s.option.button)
			.on("change.slovastick", function() {
				var mode = $(this).find(":selected").val().toLowerCase();

				s.option.console
					.val("")
					.off()
					.on("focus", function() {
						// s.yellow("I'am on console");
					});

				// words["after_current_element"] = function(ele) {};

				if ("command" === mode) {
					// http://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/
					if ('webkitSpeechRecognition' in window) {
						function stop() {
							recognition.stop();
							delete recognition;
						}

						if (recognition)
							stop();

						var recognition = new webkitSpeechRecognition()
							,interimResult
							;

						// var timeout = setTimeout(function() {
						// 	clearTimeout(timeout);
						// 	stop();
						// }, 3000);

						recognition.lang = s.option.user.language;
						recognition.continuous = true;
						recognition.interimResults = true;

						recognition.onerror = function(event) {
							s.red("recognition - " + event.error);
							stop();
						};

						recognition.onresult = function(event) {
							// var pos = s.option.console.getCursorPosition() - interimResult.length;

							// s.option.console.val(s.option.console.val().replace(interimResult, ''));
							interimResult = "";
							// s.option.console.setSelectionRange(pos, pos);

							// s.library.selectRange(s.option.console, interimResult.length)

							for (var i = event.resultIndex; i < event.results.length; ++i) {
								var str = event.results[i][0].transcript;

								if (event.results[i].isFinal) {
									// if (str !== s.option.console.val())
										return s.option.console.val(str.slice(1) + "\r\n").keyup();


									// s.option.console.val(s.option.console.val() + " " + event.results[i][0].transcript);
									// s.current().key("run", str).run();
								}
								else {
									// if (str !== s.option.console.val())

									interimResult += str;
								}
							}

							s.option.console.val(interimResult.slice(1)).keyup();
						};

						recognition.start();

						// $(this).one("keypress.slovastick", stop);
					}

					// run command
					s.option.console
						.on("keyup.slovastick", function(event) {
							if (13 !== event.which)
								return;

							var val = s.option.console.val();

							// is XML ?
							if (/^\s*</.test(val)) {
								//keepScripts = true
								return s.plugin($($.parseHTML(val, true))).log("is xml");
								// 
							}
							//is command
							s(val);

							s.option.console.val("");
						})
				}
				else if ("info" === mode) {
					// words["after_current_element"] = function(ele) {
					// 	var clone 	= $(ele).clone()
					// 		,organs = clone.children().remove()
					// 		,text 	= clone.text().replace(/\s+/g, " ")
					// 		,found 	= s.library.find(ele)
					// 		;

					// 	clone.remove();

					// 	s.library.ele().key("say", "in english " + text).run();

					// 	s.option.console.val(
					// 		  "-------text-------\r\n" 		+ text
					// 		+ "\r\n-------xpath------\r\n"	+ found["xpath"] 
					// 		+ "\r\n-------css--------\r\n"  + found["css"]);
					// }

					// s.memory.ele["after_current"]();

					// setTimeout(function() {
					// 	var allInBody = $("*", "body").not($("*", s.option.panel).andSelf());

					// 	allInBody.on("mouseover.slovastick-mouseover", function(event) {
					// 		event.stopPropagation();
					// 		s.library.ele(this).key("show-no-scroll", "")["show"]()["current"]();
					// 	});

					// 	$(window)
					// 		.on("keydown.slovastick-mouseover keyup.slovastick-mouseover mousedown.slovastick-mouseover click.slovastick-mouseover", function() {
					// 			$(this).add(allInBody)
					// 				.off(".slovastick-mouseover");
					// 		});
					// }, 500);
				}
			})
			.change();

		s.option.button.language 	= $("[name='language']", 	s.option.button)
			.on("change.slovastick", function() {
				var language = $(this).find(":selected").val().toLowerCase();

				langCode = {
					"english"	: "en"
					,"russian"	: "ru"
				}

				s.option.user.language = langCode[language];
				s.option.button.mode.change();
			});

		s.option.button.sound 		= $("[name='sound']", 		s.option.button)
			.on("change.slovastick", function() {
				s.option.user.sound.volume = parseInt($(this).find(":selected").val().slice(6));
			});

		s.option.button.kick 		= $("[name='kick']", 		s.option.button)
			.on("click.slovastick", function() {
				if ("10px" === s.option.panel.css("right"))
					s.option.panel.css({"left":"10px", "right":"auto"});
				else
					s.option.panel.css({"left":"auto", "right":"10px"});
			});

		$(window)
			.on("resize.slovastick", function() {
				s.option.console.css("max-width", 	($(window).width()  - 40) + "px");
				s.option.console.css("max-height",	($(window).height() - 90) + "px");
			})
			.resize()
			.on("keydown.slovastick", function(event) {
				var result = s.library.button.keydown(event);

				if (!result)
					return;
				
				if (s.library.button.has(["up", "down"])) {
					if (s.option.console.is(":focus"))
						s.option.console.blur();
					else
						s.option.console.focus();
				}
				else if (s.library.button.has(["up"], ["down"], ["left"], ["right"])) {
					if (s.option.console.is(":focus")) {
						if (s.library.button.has(["up"], ["down"]))
							event.preventDefault();

						return;
					}
					$(window)
						.on("keyup.slovastick-move", function(event) {
							s.move(s.library.button.last.keydown);
						})
						.on("keydown.slovastick-move keyup.slovastick-move", function(event) {
							$(this)
								.off(".slovastick-move");
						});
				}
				else if (s.library.button.has(["shift", "control"])) {
					var timeout = setTimeout(function() {
						if (s.option.console.is(":focus"))
							s.option.console.blur()
						else
							s.option.console.focus();
					}, 1000);

					$(window)
						.on("keydown.slovastick-mouseover keyup.slovastick-mouseover", function() {
							clearTimeout(timeout);
						});
				}
				else if (s.library.button.has(["shift"], ["control"])) {
					var timeout = setTimeout(function () {
						timeout = false;
					}, 500);

					var isShift = s.library.button.shift;

					$(window)
						.on("keyup.slovastick-move", function(event) {
							if (timeout)
								var m = isShift ? "up" 		: "down";
							else
								var m = isShift ? "left" 	: "right";

							s.move(m);
						})
						.on("keydown.slovastick-move keyup.slovastick-move", function(event) {
							$(this)
								.off(".slovastick-move");

							clearTimeout(timeout);
						});
				}
			})
			.on("keyup.slovastick", s.library.button.keyup);

		s.option.program.status = "on";

		s.yellow("I there! Hello :>");

		s.console(slovastick());
	};
	//
	s.call = function(string) {
		// var data = string.match(/^\s*(\S+)\s+(.*)/);

		// if ("string" === data[1]);
		// 	return '"' + data[2].replace('"', '\"') + '",';
		
		// if ("integer" === data[1]);
		// 	return parseInt(data[2]) + ',';
	};
	//
	s.item = function(string) {
		var data = string.match(/^\s*(\S+)\s+(.*)/);

		s.yellow(data[1], data[2])

		if ("string" === data[1])
			return '"' + data[2].replace('"', '\"') + '",';
		
		if ("integer" === data[1])
			return parseInt(data[2]) + ',';
	};
	//
	s.green = function(result) {
		if (s.option.program.debug.mode && window.console && "function" === typeof window.console.log)
			window.console.log("WORDS OK: ", arguments);

		s.library.audio.play.signal("green");

		return s;
	};
	//
	s.yellow = function() {
		if (s.option.program.debug.mode && window.console && "function" === typeof window.console.error)
			window.console.error("WORDS LOG: ", arguments);

		s.library.audio.play.signal("yellow");

		return s;
	};
	//
	s.red = function() {
		if (s.option.program.debug.mode && window.console && "function" === typeof window.console.error)
			window.console.error("WORDS ERROR: ", arguments);

		s.library.audio.play.signal("red");

		return null;
	};
	//
	s.say = function(string) {
		s.green("say", string)
		s.library.audio.play.speech(string, s.option.user.language);

		return s;
	};
	// go to url
	s.url = function(url) {
		url = $.extend(true, {
			is: ""
			,route: ""
		}, url);

		var href  = window.document.location.href;
		var	equal = (href.slice(0, url.is.length) === url.is);
		var pname = window.document.location.pathname.slice(1);

		if (!equal || !((new RegExp(url.route)).test(pname))) {
			window.document.location.href = url.is;
		}
	};
	// go to element
	s.go = function(go) {
		go = $.extend(true, {
			is: s.memory.go.xpath
			,context: undefined
			,position: {
				is: (s.memory.go.members[go.is] || 1)
				,change: 0
			}
			,current: {
				is: true
			}
			,and: {
				say: {
					text: {
						is: s.option.user.go.and.say.text.is
					}
				}
				,animate: {
					is: true
					,scroll: {
						is: true
					}
					,color: {
						is: s.option.user.go.and.animate.color.is
					}
				}
			}
		}, go);

		go.is = s.type.xpath(go);

		if (!go.is) {
			return null;
		}

		var left_xpath = [];
		var right_xpath = go.is.split("/");
		var members = s.memory.go.members;

		if ("." !== go.is[0]) {
			while (right_xpath.length) {
				left_xpath.push(right_xpath.shift());
				var l = left_xpath.join("/")

				// s.green("!!!ok", l, right_xpath.join("/"))

				if (right_xpath.length && members[l]) { //right_xpath.length && 

					l = "(" + l + ")[" + members[l] + "]";
					left_xpath = l.split("/")
					go.is = right_xpath.join("/");

					if ("/" === go.is[0])
						go.is = "./" + go.is;

					go.is = l + "/" + go.is;

					// s.green("!!!!!!!!!!!!", right_xpath, a)
				}
			}
		}
		// s.green("!!!final", left_xpath.join("/"), a)

		


		// var left_xpath = a;
		// var right_xpath = "";

		// if ("/" === a[0]) {
		// 	while (-1 !== (i = left_xpath.lastIndexOf("/"))) {
		// 		// s.yellow(right_xpath, left_xpath)

		// 		// s.green("while", right_xpath)

		// 		if (right_xpath && "number" === typeof s.memory.go.members[left_xpath]) {
		// 			right_xpath = "." + right_xpath;
		// 			a.context = s.type.element(left_xpath).eq(s.memory.go.members[left_xpath] - 1);

		// 			// s.green("!!!!!!!!!!!!", right_xpath)

		// 			break;
		// 		}

		// 		// var i = left_xpath.lastIndexOf("/");

		// 		// if (-1 === i) 
		// 		// 	break;

		// 		right_xpath = left_xpath.slice(i) + right_xpath;
		// 		left_xpath 	= left_xpath.slice(0, i);
		// 	}
		// }

		// s.green("MEMO", s.memory.go.members[a.element.is])

		var elements = s.type.element({is:go.is});

		// s.yellow(a, "a", a.context);

		if (!elements.length) {
			return null;
		}

		s.memory.go.xpath = go.is;

		if (go.position.change && !go.position.is) {
			return null;
		}
		else if (go.position.is) {
			if (!(go.position.is + go.position.change)) {
				return null;
			}

			go.position.is += go.position.change;

			if (!elements.eq(go.position.is - 1).length) {
				if (1 >= go.position.is) {
					s.memory.go.members[go.is] = 1;
				}
				else if (go.position.is > elements.length) {
					s.memory.go.members[go.is] = elements.length;
				}

				return null;	
			}

			s.memory.go.members[go.is] = go.position.is;
			elements = elements.eq(go.position.is - 1);
		}


		// 
		if (go.and.animate.is) {
			var v = elements.eq(0).focus();

			if (go.and.animate.scroll.is) {
				if (v.length) {
					var offset 			= v.offset();
					var scrollTopValue 	= parseInt(offset ? offset.top : 0) - Math.round($(window).height()/2) + "px";

					$("html, body").stop(true).animate({"scrollTop": scrollTopValue}, {"duration": 300, "easing": "swing"});
				}
			}

			elements.filter(':visible').each(function(index, element) {
				element 	= $(element);
				var offset 	= element.offset();

				$("<div title='slovastick temporary element'>")
					.css({
						"position"	: "absolute"
						,"width"	: element.css("width")
						,"height"	: element.css("height")
						,"left"		: offset.left
						,"top"		: offset.top
						,"z-index"	: "2147483647"
						,"background-color": go.and.animate.color.is
					})
					.on("mouseover", function(event) {
						event.preventDefault();
						event.stopPropagation();
					})
					.prependTo($("#slovastick"))
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
		}

		// code parse
		elements.each(function(index, element) {
			var c = s.current();

			if (go.current.is) {
				s.current(element).focus(element);
			}

			var code = s.library.node.parse(element);

			// if ("all" === s.option.program.debug.mode)
				// s.green("ON element", elements[i], "EVAL code", code)

			// s.green();


			if (go.and.say.text) {
				var te = s.library.text.self(element);

				if (te) {
					s.say(element.tagName + ". " + te);
				}
				else {
					s.say(s.type.element({is: s.current()})[0].tagName + ". " + s.library.text.self(c));
				}
			}

			if (code) {
				try {
					eval("result = " + code);

					if (null !== result) {
						// if (go.and.say.text) {

						// 	elements.each(function(index, element) {
						// 		console.log("TTTTTTTTTTTTTTTTTTTTTTTT", elements)
						// 		s.say(element.tagName + ". " + s.library.text.self(element));
						// 	})
						// }

						return;
					}
				}
				catch(e) {
					s.red("some error", e);

					if (go.current.is) {
						s.current(c).focus(element);
					}					
				}
			}
		})

		return s;
	};
	// move to sibling element
	s.move = function(direction) {
		if ("object" === typeof direction)
			direction = direction.toString();

		var direct 	= {
			up 		: "/preceding-sibling::*"
			,down 	: "/following-sibling::*"
			,left 	: "/ancestor::*"
			,right 	: "/child::*"
		};

		// show on other position
		if (("up" === direction) && s.go({is: s.memory.go.xpath, position:{change: -1}})) {
			return s.green("I move up");
		}
		else if (("down" === direction) && s.go({is: s.memory.go.xpath, position:{change: 1}})) {
			return s.green("I move down");
		}
		else if (direct[direction]) {
			var masSiblings = s.library.find({is:s.current() + direct[direction]});

			if (-1 < $.inArray(s.option.browser.name, ["mozilla", "msie", "chrome"]) && 
				-1 < $.inArray(direction, ["left", "up"])) {
					masSiblings.reverse();
			}

			for (var i = 0; i < masSiblings.length; i++) {
				if (null !== s.go({is:masSiblings[i]})) {
					return s;
				}
			}
		}

		return s.go({and:{animate:{color: "red"}}}).red("I can't move to " + direction + ", i stop there...");
	};
	//
	s.focus = function(a) {
		a = s.type.element(a).focus();

		if (!a.length) {	
			return $(":focus");
		}

		return s;
	}
	//
	s.console = function(console) {
		if (!s.option.console)
			return;

		if (!console)
			return s.option.console.val();

		s.option.console.val(console);

		return s;
	}
	//
	s.plugin = function(plugin) {
		plugin = $.extend(true, {
			url: ""
			,prepend: "#slovastick"
			,callback: function() {}
		}, plugin);

		if (!plugin.url)
			return s.red("bad url for plugin", plugin.url);

		$.ajax(plugin.url, {
			dataType: 'text'
			,cache: false
			,timeout: 5000
			,success: function(data) {
				try {
					$($.parseHTML(data, true)).each(function(index, element) {
						if (!element.tagName || "#" === element.nodeName[0])
							return;

						s.green(plugin.prepend, s.library.find({is: plugin.prepend}))

						// .children(element.tagName).remove();
						s.library.find({is: plugin.prepend}).prepend(element);

						// s.run(element);
					});
					s.green("I loaded plugin");
					plugin.callback();
				}
				catch (e) {
					s.red("I can't find correct plugin for that site", e);
				}
			}
			,error: function() {
				plugin.callback();
			}
		});

		return s;
	}
	//
	s.type = {
		element: function(element) {
			element = $.extend(true, {
				is: $()
				// ,"xpath": true
				// ,context: window.document
			}, element);

			var result = element.is;

			if ("object" !== typeof result) {
				result = s.library.find(element);
			}

			return $(result);
		}
		,path: function(path) {
			path = $.extend(true, {
				is: ""
				,"xpath": true
				// ,context: window.document
			}, path);

			var result = path.is;

			if ("string" !== typeof result) {
				result = s.library.find(path);

				if (result) {
					result = path.xpath ? result.xpath : result.css;
				}
			}

			return result;
		}
		,xpath: function(xpath) {
			xpath = $.extend(true, {
				// is: ""
				// ,"xpath": true
				// ,context: window.document
			}, xpath);

			return s.type.path(xpath);
		},
		css: function(css) {
			css = $.extend(true, css, {
				"xpath": false
				// ,is: ""
				// ,context: window.document
			});

			return s.type.path(css);
		}
	}
	//
	s.current = function(element) {
		if (!element)
			return s.memory.current.element;

		if ("string" !== typeof element)
			element = s.library.find({is:element})["xpath"];

		s.memory.current.element = element;
		s.console(slovastick());

		return s;
	}
	// click on element
	s.click = function(a) {
		var element = s.type.element(a || s.focus()).parents("a").andSelf().filter("a[href]:eq(0)").click();

		if (element.attr("href") && !element.attr("onclick"))
			window.document.location.replace(element.attr("href"));

		return s;
	};
	//
	s.title = function() {
		
	}
	//
	// 	-	-	-	-	-	-	-	-	-	-	aliaces	-	-	-	-	-	-	-	-	-	-	-
	//
	s.show = function(arg) {
		s.go({is:arg, current:{is:false}});
	}
	//
	// 	-	-	-	-	-	-	-	-	-	-	loading	-	-	-	-	-	-	-	-	-	-	-
	//
	s.library.loader({before: [
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
						if (!s.option.program.src.program)
							s.option.program.src.program = masScript[1];

						var script 		= window.document.createElement("script");

						script.onload 	= function() {
							$ = window.jQuery.noConflict(true);
							s.library.loader();
						}

						script.src 		= encodeURI(s.option.program.src.program + "lib/jquery-2.0.2.min.js");

						return window.document.getElementsByTagName('head')[0].appendChild(script);
					}
				}

				return s.red("can't load jQuery");
			}

			s.library.loader();
		}
		//
		,function() {
			s.$ = $;

			$.fn.reverse = [].reverse;

			// on document loaded
			$(function(){
				s.library.loader();
			});
		}
		//
		,function() {
			var scripts 		= $("script[src*='slovastick.js']")
				,match  		= scripts.last().attr("src").match(/^(.*)slovastick\.js\??(.*)$/)
				,script_src 	= match[1]
				,script_search 	= match[2].split("#")[0]
				,search 		= script_search.split("&")
				,current_src 	= window.document.location.origin + window.document.location.pathname
				;

			scripts.not(scripts.last()).remove();

			// work with debug-script source
			if (s.option.program.debug.mode
				&& s.option.program.debug.src
				// && (s.option.program.debug.src !== current_src)
				&& (s.option.program.debug.src !== script_src)) {

				var script = $("<script>")
					.attr("src", encodeURI(s.option.program.debug.src + "slovastick.js?" + script_search + "#" + (new Date()).getTime()));

				$("head")
					.append(script);

				return;
			}

			scripts.attr("title", "slovastick - DOM manipulator. Version " + s.option.program.version)

			if (!s.option.program.src.program)
				s.option.program.src.program = script_src;

			if (!s.option.program.src.plugin)
				s.option.program.src.plugin = script_src + "plugin/";

			if (!s.option.program.src.sound)
				s.option.program.src.sound = script_src + "sound/";

			// requst
			for (i in search) {
				var kv = search[i].split("=");

				if (!kv[0] || !kv[1])
					continue;

				if ("debug.mode" === kv[0]) {
					var t = {
						"true": true
						,"false": false
						,"all": "all"
					};

					if (t[kv[1]]) {
						s.option.program.debug.mode = t[kv[1]];
					}
				}
			}

			if (!window.document.evaluate)
				return $.getScript("http://wicked-good-xpath.googlecode.com/files/wgxpath.install.js")
					.success(function() {
						window.wgxpath.install();
						s.library.loader();
					})

			s.library.loader();
		}
		//
		,function() {
			$("#slovastick").remove();
			var site_hello = $("hello:eq(0)").children().clone();
			$("hello:eq(0)").remove();

			s.plugin({
				url: s.option.program.src.plugin + "hello.xml"
				,prepend: "/html/body"
				,callback: function() {
					$("#slovastick")
						.attr("title", "slovastick - DOM manipulator. Version " + s.option.program.version)
						.prepend(site_hello);

					// alert("test firefox")

					s.memory.audio.signal = $('<audio id="slovastick_signal"></audio>')[0];
					s.memory.audio.speech = $('<audio id="slovastick_speech"></audio>')[0];

					$("#slovastick_iframe").contents().find("body").css({display:"none"})
						.append(s.memory.audio.signal)
						.append(s.memory.audio.speech);

					s.move("right");
					s.library.loader();
				}
			});
		}
		,function() {
			// load plugin for this host
			var host = window.document.location.hostname;

			if ("www." === host.slice(0, 4)) {
				host = host.slice(4);
			}

			s.plugin({url: s.option.program.src.plugin + host + ".xml", callback: s.library.loader});
		}
		,function() {
			// fix browser bug or jQuery - http://bugs.jquery.com/ticket/13465
			if (-1 !== $.inArray(s.option.browser.name, ["mozilla", "msie"])) {
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
			
				recursiveFix($("#slovastick"));
			}

			s.library.loader();
		}
		,function() {
			s.on();
			$(window).on("hashchange", function(event) {
				event.preventDefault();

				s.yellow("s2")
			})
			$(window).on("focus", function(event) {
				// event.preventDefault();

				s.yellow("focus")
			})
			$(window).on("blur", function(event) {
				// event.preventDefault();

				s.yellow("blur")
			})
			s.library.loader();
		}
	]});
}((window.slovastick && window.slovastick.$) || window.jQuery))