var top = this;

var arguments = [];
var window= top;

arguments.callee = {};
var DEBUG_FUNC_INDEX = 1;

var del = ["arguments","top","window","Emp","empBridge","util","DEBUG_FUNC_INDEX","del","BridgeUtil","ResultUtil"];

function jsDebug(){
	
}

jsDebug.debugCommand = null;
jsDebug.currResource = null;
jsDebug.breakpoints = null;
jsDebug.functionStack = [];
jsDebug.currResource = null;
jsDebug.currLine = null;
jsDebug.isExpression = false;

/**
 * 
 */
jsDebug.getErrorStack = function(func) {
	var stack = [];
	while (func) {
		var funcStr = func.toString();
		var funcOffset = funcStr.indexOf(")");
		var funcHead = funcStr.substring(0, funcOffset + 1);
		var args = func.arguments;
		var argArr = [];
		for (var i = 0; i < args.length; i++) {
			argArr.push(args[i]);
		}
		stack.push(funcHead + json2string(argArr, 12));
		func = func.caller;
	}
	return stack.join("\n");
}

/**
 * 
 */
var parseVars = function(line) {
	var varNames = [];
	if (line && line.length > 0) {
		var endOffset = line.indexOf(";");
		if (endOffset > 0) {
			line = line.substring(0, endOffset);
		}
		var lineArr = line.split(",");
		for (var i = 0; i < lineArr.length; i++) {
			var varStr = lineArr[i];
			var varEndOffset = varStr.indexOf("=");
			if (varEndOffset > 0) {
				varNames.push(varStr.substring(0, varEndOffset));
			} else {
				varNames.push(varStr);
			}
		}
	}
	return varNames;
}

/**
 * 
 */
jsDebug.updateStack = function(args, resource, scope, line, evalFunc) {
	if (args && args.callee) {
		var func = args.callee;
		func.__resource = resource;
		func.__line = line;
		func.__evalFunc = evalFunc;
		func.__scope = scope;
		for (var i = jsDebug.functionStack.length - 1; i > -1; i--) {
			if (func == jsDebug.functionStack[i]) {
				jsDebug.functionStack = jsDebug.functionStack.slice(0, i + 1);
				return;
			}
		}
		jsDebug.functionStack.push(func);
	} else {
		jsDebug.functionStack = [];
	}

}

/**
 * 
 */
var getFuncData = function(args, evalFunc) {
	
		var vars = [];
		var func = args.callee;
		if (func) {
			var funcStr = func.toString().replace(/\n/g, "");
			var argStart = funcStr.indexOf("(");
			var argEnd = funcStr.indexOf(")");
			if (argStart > 0 && argEnd > 0) {
				var argStr = funcStr.substring(argStart + 1, argEnd);
				vars = argStr.split(",");
			}
			var nameArr = funcStr.split("var ");
			for (var i = 1; i < nameArr.length; i++) {
				var line = nameArr[i];
				vars = vars.concat(parseVars(line));
			}
		}
		var data = {};
		
		for (var i = 0; i < vars.length; i++) {
			var key = vars[i];
			if (key && key.length > 0) {
				key = key.replace(/\n|\r|\t| /g, "");
				if (/^[A-Za-z0-9_\$]*$/.test(key)) {
					try {
						var result = evalFunc(key);
						if (result == undefined) {
							data[key] = {"value":"undefined","type":"string"};
						} else if (result == null) {
							data[key] = {"value":"null","type":"string"};
						} else {
							data[key] = {"value":evalFunc(key),"type":typeof(evalFunc(key))};
						}
					} catch (e) {

					}
				}
			}
		}
		return data;
}

var getWindowData = function(args,evalFunc){
	var data = {};
	for (var i in top) { 
	    data[i] = {value:top[i],type:typeof(top[i])};
	}
//	return {"x":{"value":top.x,"type":typeof(top.x)}};

	return {"window":{value:top,type:typeof(top)}};
}


/**
 * find if arguments is stepreturn context
 */
jsDebug.isStepReturn = function(args) {
	if (args) {
		var func = args.callee;
		for (var i = jsDebug.functionStack.length - 2; i > -1; i--) {
			if (func == jsDebug.functionStack[i]) {
				return true;
			}
		}
		return false;
	} else {
		return true;
	}
}

/**
 * find if arguments is stepover context
 */
jsDebug.isStepOver = function(args) {
	if (args) {
		var func = args.callee;
		for (var i = jsDebug.functionStack.length - 1; i > -1; i--) {
			if (func == jsDebug.functionStack[i]) {
				return true;
			}
		}
		return false;
	} else {
		return true;
	}
}

/**
 * 
 */
jsDebug.error = function(e, resource, line,callFunc) {
	try {
		var funcStr = callFunc + "";
			if(funcStr.indexOf("function anonymous")>=0){
				funcStr = undefined;
			}
		var postData = {
			"ERROR" : encodeURI(e),
			"COMMAND" : "ERROR",
			"RESOURCE" : resource,
			"LINE" : line,
			"ERRORFUNC":funcStr,
			"ISIE":isIE
		}
		empBridge.debug(obj2string(postData));
	} catch (e) {

	}
}

/**
 * 
 */
jsDebug.stepReturn = function(func) {
	try {
		var data = jsDebug.getFuncData(func.arguments, func.__evalFunc);
		jsDebug.updateStack(func.arguments, func.__resource, func.__scope,
				func.__line, func.__evalFunc);
		if (func.__scope != top) {
			data["this"] = func.__scope;
		}
		var postData = {
			"STACK" : data,
			"COMMAND" : jsDebug.debugCommand,
			"RESOURCE" : func.__resource,
			"LINE" : func.__line
		}
		var res = empBridge.debug(obj2string(postData));
		jsDebug.parseResult(res,func.__evalFunc);
		
	} catch (e) {
	}
}


jsDebug.evalExpression = function(expression, evalFunc) {
	try {
	//	jsDebug.xmlHttp.open("POST", "/jsdebug.debug?" + new Date(), false);
		var postData = {
			"STACK" : {},
			"COMMAND" : "EXPRESSION",
			"EXPRESSION" : expression
		}
		try {
			jsDebug.isExpression = true;
			var ret = evalFunc(expression);
			if(typeof(ret)=="undefined"){
				ret = "undefined";
			}else if(ret==null){
				ret = "null";
			}
			postData["RESULT"] = ret;
		} catch (e) {
			postData["ERROR"] = e;
		}
		jsDebug.isExpression = false;
		var res = empBridge.debug(obj2string(postData));
		jsDebug.parseResult(res,evalFunc);
	} catch (e) {

	}
}

jsDebug.evalValue = function(expression, evalFunc){
	try {
//		jsDebug.xmlHttp.open("POST", "/jsdebug.debug?" + new Date(), false);
		var postData = {
			"STACK" : {},
			"COMMAND" : "VALUE",
			"EXPRESSION" : expression
		}
		try {
			jsDebug.isExpression = true;
			var ret = evalFunc(expression);
			var data = {};
			if(typeof(ret)=="undefined"){
				ret = "undefined";
			}else if(ret==null){
				ret = "null";
			}else{
				for(var prop in ret){
					try{
						if(prop!="postData"&&!contains(del,prop)){
						var value = ret[prop];
						var type = typeof(value);
						if(type=="function"){
							continue;
						}
						var stringValue = "";
						if(value){
							stringValue = value.toString();
						}
						if(value==null){
							stringValue = "null";
							type = "null";
						}else if(value==undefined){
							stringValue = "undefined";
							type = "undefined";
						}
						data[prop] = {"value":stringValue,"type":typeof(value)};
						}
					}catch(e){

					}
				}
			}
			postData["RESULT"] = data;
		} catch (e) {
			postData["ERROR"] = e;
		}
		jsDebug.isExpression = false;
		var submitString = "{}";
		try{
			submitString = json2string(postData);
		}catch(e){

		}
		var res = empBridge.debug(obj2string(postData));
		jsDebug.parseResult(res,evalFunc);
	} catch (e) {
		alert(e);
	}
}

/**
 * 
 */
jsDebug.parseResult = function(result, evalFunc) {
	if (result) {
		if (result.indexOf("{") == 0) {
			try {
				eval("var retObj = " + result);
				if( retObj["COMMAND"]){
					if(retObj["COMMAND"]=="EXPRESSION"){
						jsDebug.evalExpression(retObj["EXPRESSION"], evalFunc);
					}else if(retObj["COMMAND"]=="VALUE"){
						jsDebug.evalValue(retObj["EXPRESSION"], evalFunc);
					}else{
						jsDebug.isExpression = false;
						jsDebug.debugCommand = retObj["COMMAND"];
						if (jsDebug.debugCommand == "BREAKPOINT") {
							jsDebug.breakpoints = retObj["BREAKPOINTS"];
						}
					}
				}
                return retObj;
			} catch (e) {
			}
		} else {
			 alert("Debug error:" + result);
		}
	} else {

	}
}



function json2string(obj, depth) {
	depth = depth || 0;
	if (typeof obj == "function") {
		return "\"function\"";
	}  else if (obj && typeof obj.pop == 'function' && obj instanceof Array) {
		return array2string(obj, depth + 1);
	} else if (typeof obj == "object") {
		return obj2string(obj, depth + 1);
	} else {
		if (typeof obj == "string") {
			return "\"" + obj.replace(/"/gm, "'").replace(/\n|\r/gm, "")
					+ "\"";
		} else if (typeof obj == "number") {
			if (isFinite(obj)) {
				return obj;
			} else {
				return "\"out of number\"";
			}
		} else {
			//return util.jsonToString(obj).replace(/"/gm, "\\\"").replace(/\n|\r/gm, "");
		}
	}
}

function obj2string(obj, depth) {
	depth = depth || 0;
		var arr = [];
		for (var prop in obj) {
			try {
				if (obj.hasOwnProperty(prop) && typeof(obj[prop]) != "function") {
					if (depth < 9) {
						arr.push("\"" + prop + "\":"
								+ json2string(obj[prop], depth + 1));
					} else {
						arr.push("\"" + prop + "\":\"...\"")
					}
				}
			} catch (e) {

			}
		}
		return "{" + arr.join(",") + "}";
}

function complexObj2String(obj){
	var arr = [];
	for (var prop in obj) {
		try {
			if (typeof(obj[prop]) != "function") {
				var value = (obj[prop] + "").replace(/"/gm, "'").replace(/\n|\r/gm, "");
				arr.push("\"" + prop + "\":\""
						+ value + "\"");
			}
		} catch (e) {

		}
	}
	return "{" + arr.join(",") + "}";
}
function array2string(array, depth) {
	depth = depth || 0;
	var arr = [];
	for (var i = 0; i < array.length; i++) {
		arr.push(json2string(array[i], depth + 1));
	}
	return "[" + arr.join(",") + "]";
}

function mergeJsonObject(jsonbject1, jsonbject2)  
{  
    var resultJsonObject={};  
    for(var attr in jsonbject1){  
        resultJsonObject[attr]=jsonbject1[attr];  
    }  
    for(var attr in jsonbject2){  
        resultJsonObject[attr]=jsonbject2[attr];  
    }  

    return resultJsonObject;  
};  

function convertStringToJSON(str){
    var stu = eval('('+str+')');
    return stu;
}

function contains(a,obj){
	var i = a.length;
	while(i--){
		if(a[i]===obj){
			return true;
		}
	}
	return false;
}

jsDebug.getBreakPoint = function(async) {
	var postData = {"COMMAND":"RESUME"}; 
    var res = empBridge.debug(obj2string(postData));
    var retObj = util.stringToJson(res);
    jsDebug.breakpoints = retObj["BREAKPOINTS"];
    return;

	async = async?false:true;
	log(":"+async);
	try{
//	var jsonResume = "{\"COMMAND\":\"RESUME\"}";
		var postData = {"COMMAND":"RESUME"}; 
	if(async){
		var id;
	    log("");
		id = setInterval(jsDebug.getBreakPoint,1000);
	}else{
		log("");
	    var res = empBridge.debug(obj2string(postData));
	    var retObj = util.stringToJson(res);
	    jsDebug.breakpoints = retObj["BREAKPOINTS"];
	}
	} catch(e){
		
	}
}

jsDebug.getBreakPoint();

jsDebug.debug =  function(resource,line,scope,args,evalFunc){
	var isNewStack = false;
	if(args&&args["_funcIndex"]==undefined){
		if(args.callee.caller && args.callee.caller.arguments){
			if(args.callee.caller.arguments["__funcIndex"]==undefined){
				args["__funcIndex"] = DEBUG_FUNC_INDEX++;
				isNewStack = true;
			}else{
				args["__funcIndex"] = args.callee.caller.arguments["__funcIndex"];
			}
		}
	}
	
	if (jsDebug.isExpression) {
		return;
	}
	
	
	try {
		jsDebug.currResource = resource;
		jsDebug.currLine = line;
		if (jsDebug.debugCommand == null) {
			jsDebug.debugCommand = "START";
		}
		if (jsDebug.debugCommand == "TERMINATE") {
			throw "exit";
		}
		if(!jsDebug.breakpoints){
			jsDebug.getBreakPoint(true);
		}
		if (!(jsDebug.breakpoints && jsDebug.breakpoints[resource + line])) {
			if (jsDebug.debugCommand == "STEPRETURN"
					|| jsDebug.debugCommand == "STEPOVER") {
				var parentFunc = jsDebug.functionStack[jsDebug.functionStack.length
						- 2];
				var currFunc = jsDebug.functionStack[jsDebug.functionStack.length
						- 1];
				if(currFunc && (currFunc==args.callee)){
					if(jsDebug.debugCommand == "STEPRETURN"){
						return;
					}
					// do nothing
				}else{
					if (parentFunc && (args.callee.caller == parentFunc)) {
						jsDebug.stepReturn(parentFunc);
						jsDebug.debug(resource, line, scope, args, evalFunc);
						if(jsDebug.debugCommand == "STEPRETURN"){
							return;
						}
					}else{
//						if(args.callee){
//							return;
//						}
					}
				}

			}
			if (jsDebug.debugCommand == "STEPRETURN") {
				if (!jsDebug.isStepReturn(args)) {
					if(args.callee){
						return;
					}
				}
			} else if (jsDebug.debugCommand == "STEPOVER") {
				if (!jsDebug.isStepOver(args)) {
					if(args.callee){
						return;
					}
				}
			} else if (jsDebug.debugCommand == "RESUME") {
				return;
			} else if (jsDebug.debugCommand == "STEPINTO") {

			} else {
				return;
			}
		} else {
			jsDebug.debugCommand = "BREAKPOINT";
		}
		
		var data = getFuncData(args,evalFunc);
		var windowData = getWindowData(args,evalFunc);
		var stack = mergeJsonObject(windowData,data);
		
		jsDebug.updateStack(args, resource, scope, line, evalFunc);
		
		var postData = {
				"STACK" : stack,
				"COMMAND" : jsDebug.debugCommand,
				"RESOURCE" : resource,
				"LINE" : line,
				"NEWSTACK":true
		};
		var postDataStr = json2string(postData,0);
		
	    var res = empBridge.debug(postDataStr);
		
		jsDebug.parseResult(res, evalFunc);
		
	} catch (e) {

	}

};

var $jsd = jsDebug.debug;
Emp.page.setId('_body_181840164');
var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
var _div_2079087592 = new Emp.Panel({"id":"_div_2079087592","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
var _input_1518738407 = new Emp.Label({"id":"_input_1518738407","color":"#ffffff","value":"解决问题","fontSize":"25"});
_div_2079087592.add(_input_1518738407);
nav.add(_div_2079087592);
Emp.page.add(nav);
var slide = new Emp.SlidePage({"id":"slide"});
var _slidepage_1771364313 = new Emp.Panel({"id":"_slidepage_1771364313"});
_slidepage_1771364313.setWidth("100%");
_slidepage_1771364313.setHeight("100%");
var _div_754210230 = new Emp.Panel({"id":"_div_754210230","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","overflow":"y","width":"100%"});
var tmp1 = new Emp.Panel({"id":"tmp1","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var proType = new Emp.Label({"id":"proType","value":"问   题   类  型:","paddingLeft":"20"});
tmp1.add(proType);
var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_1046930553","text":"产品级","value":"1"}, {"id":"_option_532875982","text":"项目级","value":"2"}]});
tmp1.add(select);
_div_754210230.add(tmp1);
var _div_57762302 = new Emp.Panel({"id":"_div_57762302","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_754210230.add(_div_57762302);
var tmp2 = new Emp.Panel({"id":"tmp2","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var reqType = new Emp.Label({"id":"reqType","value":"问题需求类型:","paddingLeft":"20"});
tmp2.add(reqType);
var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_1702723320","text":" BUG","value":"1"}, {"id":"_option_714228707","text":" 新需求","value":"2"}, {"id":"_option_745463635","text":"拓展需求","value":"3"}]});
tmp2.add(select2);
_div_754210230.add(tmp2);
var _div_1479754976 = new Emp.Panel({"id":"_div_1479754976","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_754210230.add(_div_1479754976);
var tmp3 = new Emp.Panel({"id":"tmp3","height":"150","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_2054670550 = new Emp.Panel({"id":"_div_2054670550","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_1310890090 = new Emp.Label({"id":"_input_1310890090","value":"问   题   主  题:","paddingLeft":"20"});
_div_2054670550.add(_input_1310890090);
var select3 = new Emp.Select({"id":"select3","marginLeft":"50","width":"150","marginRight":"20","name":"iosOrAndroid","value":"3",items:[ {"id":"_option_1753905954","text":"IOS","value":"1"}, {"id":"_option_1718609423","text":"Android","value":"2"}, {"id":"_option_393898273","text":"IOS/Android","value":"3"}]});
_div_2054670550.add(select3);
tmp3.add(_div_2054670550);
var _div_1253771948 = new Emp.Panel({"id":"_div_1253771948","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var proTheme = new Emp.TextArea({"id":"proTheme","height":"100%","width":"100%"});
_div_1253771948.add(proTheme);
tmp3.add(_div_1253771948);
_div_754210230.add(tmp3);
var tmp4 = new Emp.Panel({"id":"tmp4","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_173589441 = new Emp.Panel({"id":"_div_173589441","height":"40","width":"100%"});
var _input_245132372 = new Emp.Label({"id":"_input_245132372","value":"问   题   描  述:","paddingLeft":"20"});
_div_173589441.add(_input_245132372);
tmp4.add(_div_173589441);
var _div_1066141258 = new Emp.Panel({"id":"_div_1066141258","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var proDescript = new Emp.TextArea({"id":"proDescript","height":"100%","width":"100%"});
_div_1066141258.add(proDescript);
tmp4.add(_div_1066141258);
_div_754210230.add(tmp4);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"100","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1537157536 = new Emp.Panel({"id":"_div_1537157536","height":"40","width":"100%"});
var _input_672247070 = new Emp.Label({"id":"_input_672247070","value":"客                户:","paddingLeft":"20"});
_div_1537157536.add(_input_672247070);
tmp5.add(_div_1537157536);
var _div_1446382306 = new Emp.Panel({"id":"_div_1446382306","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var cusName = new Emp.TextArea({"id":"cusName","height":"100%","width":"100%"});
_div_1446382306.add(cusName);
tmp5.add(_div_1446382306);
_div_754210230.add(tmp5);
var tmp6 = new Emp.Panel({"id":"tmp6","marginBottom":"30","height":"80","marginTop":"15","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1806263508 = new Emp.Panel({"id":"_div_1806263508","height":"40","width":"100%"});
var _input_1041944964 = new Emp.Label({"id":"_input_1041944964","value":"预计开发工作量:","paddingLeft":"20"});
_div_1806263508.add(_input_1041944964);
tmp6.add(_div_1806263508);
var _div_2000318691 = new Emp.Panel({"id":"_div_2000318691","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var effExpected = new Emp.Text({"id":"effExpected","height":"40","width":"100%"});
_div_2000318691.add(effExpected);
tmp6.add(_div_2000318691);
_div_754210230.add(tmp6);
_slidepage_1771364313.add(_div_754210230);
slide.add(_slidepage_1771364313);
var _slidepage_1108297821 = new Emp.Panel({"id":"_slidepage_1108297821"});
_slidepage_1108297821.setWidth("100%");
_slidepage_1108297821.setHeight("100%");
var _div_2035807116 = new Emp.Panel({"id":"_div_2035807116","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp7 = new Emp.Panel({"id":"tmp7","height":"80","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_695992634 = new Emp.Panel({"id":"_div_695992634","height":"40","width":"100%"});
var _input_1375025709 = new Emp.Label({"id":"_input_1375025709","value":"Bug            号:","paddingLeft":"20"});
_div_695992634.add(_input_1375025709);
tmp7.add(_div_695992634);
var _div_985565796 = new Emp.Panel({"id":"_div_985565796","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var proId = new Emp.Text({"id":"proId","height":"40","width":"100%"});
_div_985565796.add(proId);
tmp7.add(_div_985565796);
_div_2035807116.add(tmp7);
var _div_761582114 = new Emp.Panel({"id":"_div_761582114","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_2035807116.add(_div_761582114);
var tmp8 = new Emp.Panel({"id":"tmp8","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_121632173 = new Emp.Panel({"id":"_div_121632173","height":"40","width":"100%"});
var _input_7445208 = new Emp.Label({"id":"_input_7445208","value":"问 题 修 改 人:","paddingLeft":"20"});
_div_121632173.add(_input_7445208);
tmp8.add(_div_121632173);
var _div_413574870 = new Emp.Panel({"id":"_div_413574870","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var proModifier = new Emp.Text({"id":"proModifier","height":"40","width":"100%"});
_div_413574870.add(proModifier);
tmp8.add(_div_413574870);
_div_2035807116.add(tmp8);
var _div_1472579764 = new Emp.Panel({"id":"_div_1472579764","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_2035807116.add(_div_1472579764);
var tmp9 = new Emp.Panel({"id":"tmp9","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_56697471 = new Emp.Panel({"id":"_div_56697471","height":"40","width":"100%"});
var _input_1579139476 = new Emp.Label({"id":"_input_1579139476","value":"开发提交时间:","paddingLeft":"20"});
_div_56697471.add(_input_1579139476);
tmp9.add(_div_56697471);
var _div_1809466613 = new Emp.Panel({"id":"_div_1809466613","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var subTime = new Emp.Text({"id":"subTime","height":"40","width":"100%"});
_div_1809466613.add(subTime);
tmp9.add(_div_1809466613);
_div_2035807116.add(tmp9);
var tmp10 = new Emp.Panel({"id":"tmp10","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_580519697 = new Emp.Panel({"id":"_div_580519697","height":"40","width":"100%"});
var _input_776339158 = new Emp.Label({"id":"_input_776339158","value":"修   改   描  述:","paddingLeft":"20"});
_div_580519697.add(_input_776339158);
tmp10.add(_div_580519697);
var _div_1486591397 = new Emp.Panel({"id":"_div_1486591397","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var modDescript = new Emp.TextArea({"id":"modDescript","height":"100%","width":"100%"});
_div_1486591397.add(modDescript);
tmp10.add(_div_1486591397);
_div_2035807116.add(tmp10);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"140","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1480602210 = new Emp.Panel({"id":"_div_1480602210","height":"40","width":"100%"});
var _input_1588325681 = new Emp.Label({"id":"_input_1588325681","value":"提 交 代 码 库:","paddingLeft":"20"});
_div_1480602210.add(_input_1588325681);
tmp5.add(_div_1480602210);
var container = new Emp.Panel({"id":"container","height":"100%","layout":"VBox","width":"100%","paddingLeft":"20"});
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"master","value":"1"}, {"text":"lcrcbank","value":"2"}, {"text":"noahwm","value":"3"}]});
container.add(checkbox);
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"pword2016","value":"1"}, {"text":"mobile710_ga","value":"2"}]});
container.add(checkbox);
tmp5.add(container);
_div_2035807116.add(tmp5);
var tmp12 = new Emp.Panel({"id":"tmp12","height":"80","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1110713793 = new Emp.Panel({"id":"_div_1110713793","height":"40","width":"100%"});
var _input_1269864212 = new Emp.Label({"id":"_input_1269864212","value":"提交客户版本号:","paddingLeft":"20"});
_div_1110713793.add(_input_1269864212);
tmp12.add(_div_1110713793);
var _div_915327198 = new Emp.Panel({"id":"_div_915327198","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var clientVersion = new Emp.Text({"id":"clientVersion","height":"40","width":"100%"});
_div_915327198.add(clientVersion);
tmp12.add(_div_915327198);
_div_2035807116.add(tmp12);
var tmp12 = new Emp.Panel({"id":"tmp12","height":"80","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1069556050 = new Emp.Panel({"id":"_div_1069556050","height":"40","width":"100%"});
var _input_1590406960 = new Emp.Label({"id":"_input_1590406960","value":"修改文档名称:","paddingLeft":"20"});
_div_1069556050.add(_input_1590406960);
tmp12.add(_div_1069556050);
var _div_1644751429 = new Emp.Panel({"id":"_div_1644751429","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var docName = new Emp.Text({"id":"docName","height":"40","width":"100%"});
_div_1644751429.add(docName);
tmp12.add(_div_1644751429);
_div_2035807116.add(tmp12);
var tmp13 = new Emp.Panel({"id":"tmp13","marginBottom":"30","height":"-2","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1300953890 = new Emp.Panel({"id":"_div_1300953890","height":"40","width":"100%"});
var _input_358303351 = new Emp.Label({"id":"_input_358303351","value":"使   用   说  明:","paddingLeft":"20"});
_div_1300953890.add(_input_358303351);
tmp13.add(_div_1300953890);
var _div_460274069 = new Emp.Panel({"id":"_div_460274069","borderColor":"#909090","height":"150","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var useDescript = new Emp.TextArea({"id":"useDescript","height":"100%","width":"100%"});
_div_460274069.add(useDescript);
tmp13.add(_div_460274069);
_div_2035807116.add(tmp13);
_slidepage_1108297821.add(_div_2035807116);
slide.add(_slidepage_1108297821);
var _slidepage_1004577388 = new Emp.Panel({"id":"_slidepage_1004577388"});
_slidepage_1004577388.setWidth("100%");
_slidepage_1004577388.setHeight("100%");
var _div_415727402 = new Emp.Panel({"id":"_div_415727402","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp16 = new Emp.Panel({"id":"tmp16","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1656768247 = new Emp.Panel({"id":"_div_1656768247","height":"40","width":"100%"});
var _input_1452151893 = new Emp.Label({"id":"_input_1452151893","value":"测  试  人  员  :","paddingLeft":"20"});
_div_1656768247.add(_input_1452151893);
tmp16.add(_div_1656768247);
var _div_165217496 = new Emp.Panel({"id":"_div_165217496","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var peopleTest = new Emp.Text({"id":"peopleTest","height":"40","width":"100%"});
_div_165217496.add(peopleTest);
tmp16.add(_div_165217496);
_div_415727402.add(tmp16);
var _div_1967258484 = new Emp.Panel({"id":"_div_1967258484","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_415727402.add(_div_1967258484);
var tmp17 = new Emp.Panel({"id":"tmp17","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1382405272 = new Emp.Panel({"id":"_div_1382405272","height":"40","width":"100%"});
var _input_1710110171 = new Emp.Label({"id":"_input_1710110171","value":"测试截止时间:","paddingLeft":"20"});
_div_1382405272.add(_input_1710110171);
tmp17.add(_div_1382405272);
var _div_804172056 = new Emp.Panel({"id":"_div_804172056","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var testDeadline = new Emp.Text({"id":"testDeadline","height":"40","width":"100%"});
_div_804172056.add(testDeadline);
tmp17.add(_div_804172056);
_div_415727402.add(tmp17);
var _div_1231692355 = new Emp.Panel({"id":"_div_1231692355","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_415727402.add(_div_1231692355);
var tmp18 = new Emp.Panel({"id":"tmp18","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1599734109 = new Emp.Panel({"id":"_div_1599734109","height":"40","width":"100%"});
var _input_676540699 = new Emp.Label({"id":"_input_676540699","value":"测   试   用  例:","paddingLeft":"20"});
_div_1599734109.add(_input_676540699);
tmp18.add(_div_1599734109);
var _div_290536502 = new Emp.Panel({"id":"_div_290536502","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var testCase = new Emp.TextArea({"id":"testCase","height":"100%","width":"100%"});
_div_290536502.add(testCase);
tmp18.add(_div_290536502);
_div_415727402.add(tmp18);
_slidepage_1004577388.add(_div_415727402);
slide.add(_slidepage_1004577388);
Emp.page.add(slide);




 
$jsd('/flows/src/existFlow5.htmlx',267,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);});$M.page.addEvent("onLoad", function (params) { 
$jsd('/flows/src/existFlow5.htmlx',268,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("展示界面:" + params); 
$jsd('/flows/src/existFlow5.htmlx',269,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax = new $M.Ajax(); 
$jsd('/flows/src/existFlow5.htmlx',270,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.add("proId", params); 
$jsd('/flows/src/existFlow5.htmlx',271,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.setAction("/querySingleTask.jsp"); 
$jsd('/flows/src/existFlow5.htmlx',272,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.submit(function (result) { 
$jsd('/flows/src/existFlow5.htmlx',273,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("返回的值:" + result); 
$jsd('/flows/src/existFlow5.htmlx',274,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); result = Utils.stringToJson(result); 
$jsd('/flows/src/existFlow5.htmlx',275,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); loadData(result); 
}, function (errorCode, errorMsg) { 
$jsd('/flows/src/existFlow5.htmlx',277,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("ajax Error : " + errorCode + " " + errorMsg); 
}); 
}); 
$jsd('/flows/src/existFlow5.htmlx',281,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); function loadData(result) { 
$jsd('/flows/src/existFlow5.htmlx',282,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("传入的值:" + result); 
$jsd('/flows/src/existFlow5.htmlx',283,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); proType.setValue(result.proType); 
} 
 
Emp.page.render();
