test("slovastick.lib.key", function() {
	slovastick.log(slovastick)
	var ele = slovastick.lib.ele();
	deepEqual(ele, 		ele.key("first", "val"));
	deepEqual(ele, 		ele.key({"name": "second", "value": "val2", "and some": "thatsup"}));
	deepEqual(ele, 		ele.key("third", "val3"));
	strictEqual(3, 		ele.key().length);
	strictEqual("val", 	ele.key("first").value);
	strictEqual(0, 		ele.key("first").index);
	deepEqual(ele, 		ele.key("first", "val2"));
	strictEqual("val2", ele.key("first").value);
	strictEqual(2, 		ele.key("first").index);
	deepEqual(ele, 		ele.key("third", null));
	strictEqual(2, 		ele.key().length);
	deepEqual({}, 		ele.key("four"));
	deepEqual(ele, 		ele.key(null));
	strictEqual(0, 		ele.key().length);
	throws(function(){
		ele.key(function(){});
	});
	throws(function(){
		ele.key({});
	});
});