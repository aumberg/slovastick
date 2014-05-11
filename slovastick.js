// 
// slovastick - web-based DOM manipulator
// manifesto  - http://minifesto.org/
(function($) {
	var s = window.slovastick = function(param) {
		if ("function" === typeof param) {	
			return s.library.loader(function() {
				parama(s);
			});
		}

		if ("string" !== typeof param) {
			return;
		}

		// ...
		// 
	};
	//
	s["memory selected element"] 			= undefined;
	s["memory page"] 						= undefined;
	s["memory loader queue"] 				= [];
	s["memory loader history"] 				= [];
	s["memory audio signal"] 				= undefined;
	s["memory audio speech"] 				= undefined;
	s["memory audio speech listened"] 		= 0;
	s["memory text pieces for speech"] 		= [];

	//
	s.option = {
		program: {
			name 			: "Slovastick"
			,description	: "Slovastick - web-based DOM manipulator"
			,version 		: "0.2"
			,status			: "off"
			,debug : {
				mode 		: true //false || true || "all"
				,src 		: "http://localhost/"
			}
			,src : {
				program		: ""
				,plugin		: ""
				,sound		: ""
			}
		}
		,user: {
			language		: "ru"
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
		// ㊢ selenium IDE, recorder-handlers.js, Recorder.prototype.findClickableElement
		"element clickable": function(e) {
			e = $(e)[0];

			if (!e.tagName) {
				return null;
			}

			var tagName = e.tagName.toLowerCase();
			var type = e.type;

			if (e.hasAttribute("onclick") || e.hasAttribute("href") || tagName == "button" ||
				(tagName == "input" && (type == "submit" || type == "button" || type == "image" || type == "radio" || type == "checkbox" || type == "reset"))) {
					return e;
			} else {
				if (e.parentNode != null) {
					return s.library.element.clickable(e.parentNode);
				} else {
					return null;
				}
			}
		}
		//
		,"regexp to string": function(string) {
			return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		}
		//
		,"audio play signal": function(strSignalName) {
			var audio = s["memory audio signal"];

			if (!s.option.user.sound.volume || !s.option.browser.audio.extension || !audio) {
				return;
			}

			audio.volume = s.option.user.sound.volume / 100;
			audio.pause();
			audio.src = s.option.program.src.sound + strSignalName + s.option.browser.audio.extension;
			audio.play();
		}
		,"audio pause speech": function() {
			s["memory audio speech"].pause();
		}
		,"audio add and play speech": function(text) {
			s["memory text pieces for speech"].push(text);

			var audio = s["memory audio speech"];

			console.log(audio.paused || audio.ended);

			if (audio.paused || audio.ended) {
				s.library["audio play speech"]();
			}
		}
		,"audio play speech": function(text, lang) {
			var audio = s["memory audio speech"];
			var text = (text ? [text] : s["memory text pieces for speech"]).shift();
			text = $.trim(text.replace(/\s+/g, " "));
			var listened = s["memory audio speech listened"];
			var lang = (lang || s.option.user.language);

			var textPieces = s.library["text pieces"]({"text":text, "range":90});
			s["memory text pieces for speech"] = textPieces.concat(s["memory text pieces for speech"]);

			text = encodeURIComponent(s["memory text pieces for speech"].shift());

			if (!s.option.user.sound.volume || !audio || !text || !(audio.paused || audio.ended)) {
				return;
			}

			if (listened > 10) {
				setTimeout(s.library["audio play speech"], 5000)
			}

			listened++;
			s.green("audio play speech", text);


			var url = "";

			// google
			if (".mp3" === s.option.browser.audio.extension) {
				url = "http://translate.google.com/translate_tts?ie=UTF-8&q=" + text + "&tl=" + lang;
			}
			// not google
			else if (".ogg" === s.option.browser.audio.extension) {
				var local = {
					"ru": "&LOCALE=ru&VOICE=voxforge-ru-nsh",
					"en": "&LOCALE=en_US&VOICE=cmu-slt-hsmm"
				};
				url = "http://mary.dfki.de:59125/process?INPUT_TYPE=TEXT&OUTPUT_TYPE=AUDIO&INPUT_TEXT=" + text + local[lang] + "&AUDIO=WAVE_FILE";
			}		

			audio.volume = s.option.user.sound.volume / 100;
			audio.pause();
			audio.src = url;
			audio.play();
		}
		//code dependencies loader
		,"loader": function(load) {
			if (load) {
				if ("function" === typeof a) {
					s["memory loader queue"] 	= s["memory loader queue"].concat([a]);
				}
				else {
					load.before 				= (load.before || []);
					load.after 					= (load.after  || []);
					s["memory loader queue"] 	= load.before.concat(s["memory loader queue"]);
					s["memory loader queue"] 	= s["memory loader queue"].concat(load.after);
				}

				if (s["memory loader started"]) {
					return;
				}
			}

			s["memory loader started"] = true;
			
			if (s["memory loader queue"].length) {
				var call = {};

				s["memory loader history"].push(call);
				call.function = s["memory loader queue"].shift();

				try {
					return call.result = call.function();
				}
				catch(e) {
					s.red(e, "on call last function", call.function.toString(), s["memory loader history"]);
				}
			}

			return s["memory loader started"] = null;
		}
		,"speech recognition" : function() {
			// http://stiltsoft.com/blog/2013/05/google-chrome-how-to-use-the-web-speech-api/
			if (!('webkitSpeechRecognition' in window)) {
				return;
			}

			s.green("speech recognition");

			if (s["memory recognition"]) {
				s["memory recognition"].stop();
				var recognition = s["memory recognition"];
			}
			else {
				var recognition = s["memory recognition"] = new webkitSpeechRecognition();
			}

			var interimResult;

			// var timeout = setTimeout(function() {
			// 	recognition.stop();
			// 	callback();
			// 	s.green("e");
			// 	s.yellow(interimResult)
			// }, 3000);

			recognition.lang = s.option.user.language;
			recognition.continuous = true;
			recognition.interimResults = true;

			recognition.onerror = function(event) {
				s.red("recognition error - " + event.error);
				// recognition.stop();
				// callback();
			};


			recognition.onend = function() {
				var e = $(s["memory last input element"]);

				if (interimResult) {
					s.red("end - " + interimResult);
					e.val(e.val() + " " + interimResult).keyup();
				}
			};

			recognition.onresult = function(event) {
				// var pos = s.option.console.getCursorPosition() - interimResult.length;
				// s.option.console.val(s.option.console.val().replace(interimResult, ''));
				interimResult = "";
				// s.option.console.setSelectionRange(pos, pos);
				// s.library.selectRange(s.option.console, interimResult.length)

				for (var i = event.resultIndex; i < event.results.length; ++i) {
					interimResult += event.results[i][0].transcript;

					if (event.results[i].isFinal) {
						// callback();
						// clearTimeout(timeout);
						// recognition.stop();
						// s.red("ololo?", interimResult);
						recognition.stop();
						

						// return e.val(e.val() + " " + interimResult).keyup();
						// event.results[i][0].transcript);
					}
				}

				s.yellow(interimResult, "eee");

				// s["memory last input element"].val(interimResult.slice(1)).keyup();
			};

			recognition.start();

			return recognition;
		}
		// button events checker
		,"button": (function() {
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
						if (b[buttonName]) {
							result++;
						}
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

					b[b.name[buttonName]] 	= b[buttonName] = true;

					// b[b.name[buttonName]] 	= b[buttonName] = setTimeout(function() {
					// 	delete b[b.name[buttonName]];
					// 	delete b[buttonName];
					// }, 5000);

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
						var masHas = [];

						if (!$.isArray(arguments[i])) {
							s.red("bad arg for 'has' function", arguments[i]);
						}

						for (var j = 0; j < arguments[i].length; j++) {
							var name = arguments[i][j];

							if (!b[name]) {
								return false;
							}

							if (-1 === $.inArray(name, masHas)) {
								masHas.push(name);
							}
						}

						if (masHas.length === b.count()) {
							return true;
						}
					}

					return false;
				} 
			};
			// 
			return b;
		}())
		// search element by xpath or cssPath selector
		,"find": function(path_or_element, context) {
			context = ("string" === typeof context) ? s.library.find(context) : $(document);

			// find element by path
			if ("string" === typeof path_or_element) {
				result = $();

				try {
					return $(path_or_element, context);
				}
				catch (e) {}

				// if can't css try xpath
				for (var i = 0; i < context.length; i++) {
					try {
						xpath_result = window.document.evaluate(path_or_element, context[i], null, 0, null);
					}
					catch (e) {
						return null;
					}

					for (var node; xpath_result && (node = xpath_result.iterateNext()); ) {
						result = result.add(node);
					}
				}

				if ("all" === s.option.program.debug.mode) {
					var msg = ["search " + path_or_element];

					msg = msg.concat(["from contexts", context]);

					if (result.length)
						msg = msg.concat(["and found", result]);
					else 
						msg.push("and nothing found!")

					s.yellow.apply(this, msg);
				}

				return result;
			}
			else if ("object" === typeof path_or_element) {
				result = {
					"css"	: ""
					,"xpath": ""
				};

				$(path_or_element).each(function(index, element) {
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
		,"text self": function(element) {
				element 	= s.type.element(element);

				var clone 	= element.clone();
				clone.children().remove();
				
				var result 	= element.text() || clone.val();
				clone.remove();

				return result;
			}
		,"text pieces": function(param) {
				param = $.extend(true, {
					text: ""
					,range: 1
				}, param);

				// if("number" !== typeof param.range) {
				// 	return null;
				// }

				var result = [];

				(function loop() {
					if(!param.text.length)
						return;

					var part = param.text.slice(0, param.range);

					if(param.range > part.length)
						return result.push(part);

					var search = /[\.\?\!][^\.\?\!]*$/.exec(part),
						nextStartIndex = param.range;

					if(search) {
						nextStartIndex = param.range - (search[0].length - 1);
					}
					else if(-1 !== part.lastIndexOf(" ")) {
						nextStartIndex = part.lastIndexOf(" ") + 1;
					}

					result.push(param.text.slice(0, nextStartIndex));
					param.text = param.text.slice(nextStartIndex);
			
					loop();
				}())

				return result;
			}
			//
		,"set text selection range": function(element, start, end) {
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
	};
	//
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

		var elements = s.library["find"](s.console()).each(function() {
			var element = $(this);
			var text = $.trim(s.library["text self"](element));

			element.data("slovatick", text);
		});

		var x = function() {
			var elements = s.library["find"](s.console());

			elements.each(function() {
				var element = $(this);
				var text = $.trim(s.library["text self"](element));

				if (text && (element.data("slovatick") !== text)) {
					s.library["audio add and play speech"](text);
					element.data("slovatick", text);
				}
			});

			setTimeout(x, 5000);
		}

		x();

		$("*")
			.on("focus.slovastick_memory_element, mouseenter.slovastick_memory_element", function(event) {
				event.preventDefault();
				event.stopPropagation();

				s["memory last element"] = event.target;

				// console.log(event.target.tagName)

				if (-1 !== $.inArray(event.target.tagName, ["INPUT", "TEXTAREA"])) {
					s["memory last input element"] = event.target;
				}
			})

		$(window)
			.on("resize.slovastick", function() {
				s.option.console.css("max-width", 	($(window).width()  - 40) + "px");
				s.option.console.css("max-height",	($(window).height() - 90) + "px");
			})
			.resize()
			.on("keydown.slovastick", function(event) {
				var result = s.library.button.keydown(event);

				if (!result) {
					return;
				}

				// if (event.which === 16) {
				// }


				if (s.library.button.has(["shift"])) {
					s.library["speech recognition"]()
				}
					// $("#slovastick_panel [name=mode]").focus();

					// s.green("control", ele, ele.offset().top + " " + ele.offset().left)

					// $(window).one("click", function(event) {
						// s.red(event.target)
						// s.type.element(event.target)[0].tagName
						
					// });




						// if (v.length) {
						// 	var offset 			= v.offset();
						// 	var scrollTopValue 	= parseInt(offset ? offset.top : 0) - Math.round($(window).height()/2) + "px";

						// 	$("html, body").stop(true).animate({"scrollTop": scrollTopValue}, {"duration": 300, "easing": "swing"});
						// }


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

		

					// var found = s.library.find()


					// s.option.console.val(
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
				
			})
			.on("keyup.slovastick", function(event) {
				if (s.library.button.has(["shift"])) {
					if ("" + window.getSelection()) {
						s.library["audio play speech"]("" + window.getSelection());

						return;
					}

					element 	= $(s["memory last element"]);
					var offset 	= element.offset();

					s.console(s.library["find"](s["memory last element"])["xpath"]);

					var text = $.trim(s.library["text self"](element));
					s.library["audio play speech"](text);
					element.data("slovatick", text);				

					$("<div class='slovastick' title='slovastick temporary block'>")
						.css({
							"position"	: "absolute"
							,"width"	: element.css("width")
							,"height"	: element.css("height")
							,"left"		: offset.left
							,"top"		: offset.top
							,"z-index"	: "2147483647"
							,"opacity"  : 0.8
							,"background-color": "green"
						})
						.prependTo($("body"))
						.delay().animate({"opacity": 0}, 1000, function() {
							$(this).remove();
						});
				}

				s.library.button.keyup(event);
			})

			// $(window).on("hashchange", function(event) {
			// })
			// $(window).on("focus", function(event) {
			// })
			// $(window).on("blur", function(event) {
			// })
			// $(document).on("mouseover", "*:visible", function(){
			// });

		s.option.program.status = "on";
		s.yellow("I there! Hello :>");
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

		s.library["audio play signal"]("green");

		return s;
	};
	//
	s.yellow = function() {
		if (s.option.program.debug.mode && window.console && "function" === typeof window.console.error)
			window.console.error("WORDS LOG: ", arguments);

		s.library["audio play signal"]("yellow");

		return s;
	};
	//
	s.red = function() {
		if (s.option.program.debug.mode && window.console && "function" === typeof window.console.error)
			window.console.error("WORDS ERROR: ", arguments);

		s.library["audio play signal"]("red");

		return null;
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
	//
	s.console = function(text) {
		if (!s.option.console)
			return;

		if (!text)
			return s.option.console.val();

		s.option.console.val(text);

		return s;
	}
	//
	s.plugin = function(plugin) {
		plugin = $.extend(true, {
			url: ""
			,prepend: "#slovastick"
			,callback: function() {}
		}, plugin);

		if (!plugin.url) {
			return s.red("bad url for plugin", plugin.url);
		}

		s.yellow(plugin.url)

		$.ajax(plugin.url, {
			dataType: 'text'
			,cache: false
			,timeout: 5000
			,success: function(data) {
				try {
					$($.parseHTML(data, true)).each(function(index, element) {
						if (!element.tagName || "#" === element.nodeName[0]) {
							return;
						}

						s.green(plugin.prepend, s.library.find(plugin.prepend))

						// .children(element.tagName).remove();
						s.library.find(plugin.prepend).prepend(element);

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
		element: function(path, context) {
			if ("string" === typeof path) {
				path = s.library.find(path, context);
			}

			return $(path);
		}
		,xpath: function(element) {
			return s.library.find(element)["xpath"];
		},
		css: function(element) {
			return s.library.find(element)["css"];
		}
	}
	// click on element
	s.click = function(a) {
		var element = s.type.element(a || s.focus()).parents.andSelf().filter("a[href]:eq(0)").click();

		if (element.attr("href") && !element.attr("onclick"))
			window.document.location.replace(element.attr("href"));

		return s;
	};
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
			var scripts 		= $("script[src*='slovastick.js']");
			var match  			= scripts.last().attr("src").match(/^(.*)slovastick\.js(\?.*)?$/);
			var script_src 		= match[1];
			var script_search 	= match[2];
			var current_src 	= window.document.location.origin + window.document.location.pathname;

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
			s.plugin({
				url: s.option.program.src.plugin + "hello.xml"
				,prepend: "/html/body"
				,callback: function() {
					$("#slovastick")
						.attr("title", "Slovastick - DOM manipulator. Version " + s.option.program.version)

					s["memory audio signal"] = $('<audio id="slovastick_signal"></audio>')[0];
					s["memory audio speech"] = $('<audio id="slovastick_speech"></audio>')[0];

					$("#slovastick_iframe").contents().find("body").css({display:"none"})
						.append(s["memory audio signal"])
						.append(s["memory audio speech"]);


					$(s["memory audio speech"])
						.on("end", function(){
							s.library["audio play speech"]();
						})
				// .on("timeupdate", function(){
				// })
				// .data("timeout", setTimeout(play, 1000))

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

			s.on();
			s.library.loader();
		}
	]});
}((window.slovastick && window.slovastick.$) || window.jQuery))