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
Emp.page.setId('_body_2079211678');
var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
var _div_441439287 = new Emp.Panel({"id":"_div_441439287","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
var _input_1861579871 = new Emp.Label({"id":"_input_1861579871","color":"#ffffff","value":"解决问题","fontSize":"25"});
_div_441439287.add(_input_1861579871);
nav.add(_div_441439287);
Emp.page.add(nav);
var slide = new Emp.SlidePage({"id":"slide"});
var _slidepage_1467119473 = new Emp.Panel({"id":"_slidepage_1467119473"});
_slidepage_1467119473.setWidth("100%");
_slidepage_1467119473.setHeight("100%");
var _div_469747857 = new Emp.Panel({"id":"_div_469747857","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","overflow":"y","width":"100%"});
var tmp1 = new Emp.Panel({"id":"tmp1","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_203522075 = new Emp.Label({"id":"_input_203522075","value":"问   题   类  型:","paddingLeft":"20"});
tmp1.add(_input_203522075);
var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_1253717254","text":"产品级","value":"1"}, {"id":"_option_116343614","text":"项目级","value":"2"}]});
tmp1.add(select);
_div_469747857.add(tmp1);
var _div_1177001728 = new Emp.Panel({"id":"_div_1177001728","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_469747857.add(_div_1177001728);
var tmp2 = new Emp.Panel({"id":"tmp2","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_2022509931 = new Emp.Label({"id":"_input_2022509931","value":"问题需求类型:","paddingLeft":"20"});
tmp2.add(_input_2022509931);
var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_1763787965","text":" BUG","value":"1"}, {"id":"_option_120064567","text":" 新需求","value":"2"}, {"id":"_option_1438033036","text":"拓展需求","value":"3"}]});
tmp2.add(select2);
_div_469747857.add(tmp2);
var _div_1240272714 = new Emp.Panel({"id":"_div_1240272714","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_469747857.add(_div_1240272714);
var tmp3 = new Emp.Panel({"id":"tmp3","height":"150","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1060603123 = new Emp.Panel({"id":"_div_1060603123","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_1442418161 = new Emp.Label({"id":"_input_1442418161","value":"问   题   主  题:","paddingLeft":"20"});
_div_1060603123.add(_input_1442418161);
var select3 = new Emp.Select({"id":"select3","marginLeft":"50","width":"150","marginRight":"20","name":"iosOrAndroid","value":"3",items:[ {"id":"_option_1021071471","text":"IOS","value":"1"}, {"id":"_option_606389920","text":"Android","value":"2"}, {"id":"_option_1785480425","text":"IOS/Android","value":"3"}]});
_div_1060603123.add(select3);
tmp3.add(_div_1060603123);
var _div_1780503444 = new Emp.Panel({"id":"_div_1780503444","borderColor":"#909090","height":"100%","marginLeft":"5","borderWidth":"1","marginRight":"5","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_1780503444.add(textarea);
tmp3.add(_div_1780503444);
_div_469747857.add(tmp3);
var tmp4 = new Emp.Panel({"id":"tmp4","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1015730346 = new Emp.Panel({"id":"_div_1015730346","height":"40","width":"100%"});
var _input_1032415219 = new Emp.Label({"id":"_input_1032415219","value":"问   题   描  述:","paddingLeft":"20"});
_div_1015730346.add(_input_1032415219);
tmp4.add(_div_1015730346);
var _div_134717973 = new Emp.Panel({"id":"_div_134717973","borderColor":"#909090","height":"100%","marginLeft":"5","borderWidth":"1","marginRight":"5","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_134717973.add(textarea);
tmp4.add(_div_134717973);
_div_469747857.add(tmp4);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"100","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_846380830 = new Emp.Panel({"id":"_div_846380830","height":"40","width":"100%"});
var _input_190932082 = new Emp.Label({"id":"_input_190932082","value":"客                户:","paddingLeft":"20"});
_div_846380830.add(_input_190932082);
tmp5.add(_div_846380830);
var _div_654933556 = new Emp.Panel({"id":"_div_654933556","borderColor":"#909090","height":"100%","marginLeft":"5","borderWidth":"1","marginRight":"5","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_654933556.add(textarea);
tmp5.add(_div_654933556);
_div_469747857.add(tmp5);
var tmp6 = new Emp.Panel({"id":"tmp6","height":"80","marginTop":"15","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1283591428 = new Emp.Panel({"id":"_div_1283591428","height":"40","width":"100%"});
var _input_1847896281 = new Emp.Label({"id":"_input_1847896281","value":"预计开发工作量:","paddingLeft":"20"});
_div_1283591428.add(_input_1847896281);
tmp6.add(_div_1283591428);
var _div_684291853 = new Emp.Panel({"id":"_div_684291853","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"5","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_684291853.add(textarea);
tmp6.add(_div_684291853);
_div_469747857.add(tmp6);
_slidepage_1467119473.add(_div_469747857);
slide.add(_slidepage_1467119473);
var _slidepage_1692235705 = new Emp.Panel({"id":"_slidepage_1692235705"});
_slidepage_1692235705.setWidth("100%");
_slidepage_1692235705.setHeight("100%");
var _div_132073067 = new Emp.Panel({"id":"_div_132073067","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp7 = new Emp.Panel({"id":"tmp7","height":"120","vAlign":"middle","hAlign":"center","layout":"VBox","width":"100%"});
var _div_228630130 = new Emp.Panel({"id":"_div_228630130","height":"40","width":"100%"});
var _input_738350427 = new Emp.Label({"id":"_input_738350427","value":"Bug            号:","paddingLeft":"20"});
_div_228630130.add(_input_738350427);
tmp7.add(_div_228630130);
var _div_1295114223 = new Emp.Panel({"id":"_div_1295114223","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"5","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1295114223.add(textarea);
tmp7.add(_div_1295114223);
_div_132073067.add(tmp7);
var tmp8 = new Emp.Panel({"id":"tmp8","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1609077526 = new Emp.Panel({"id":"_div_1609077526","height":"40","width":"100%"});
var _input_504412811 = new Emp.Label({"id":"_input_504412811","value":"问 题 修 改 人:","paddingLeft":"20"});
_div_1609077526.add(_input_504412811);
tmp8.add(_div_1609077526);
var _div_1548159768 = new Emp.Panel({"id":"_div_1548159768","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"5","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1548159768.add(textarea);
tmp8.add(_div_1548159768);
_div_132073067.add(tmp8);
var tmp9 = new Emp.Panel({"id":"tmp9","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_663632344 = new Emp.Panel({"id":"_div_663632344","height":"40","width":"100%"});
var _input_1786226737 = new Emp.Label({"id":"_input_1786226737","value":"开发提交时间:","paddingLeft":"20"});
_div_663632344.add(_input_1786226737);
tmp9.add(_div_663632344);
var _div_1438867346 = new Emp.Panel({"id":"_div_1438867346","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"5","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1438867346.add(textarea);
tmp9.add(_div_1438867346);
_div_132073067.add(tmp9);
var tmp10 = new Emp.Panel({"id":"tmp10","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1224586130 = new Emp.Panel({"id":"_div_1224586130","height":"40","width":"100%"});
var _input_135814062 = new Emp.Label({"id":"_input_135814062","value":"修   改   描  述:","paddingLeft":"20"});
_div_1224586130.add(_input_135814062);
tmp10.add(_div_1224586130);
var _div_1999306920 = new Emp.Panel({"id":"_div_1999306920","borderColor":"#909090","height":"100%","marginLeft":"5","borderWidth":"1","marginRight":"5","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_1999306920.add(textarea);
tmp10.add(_div_1999306920);
_div_132073067.add(tmp10);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"150","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_973582157 = new Emp.Panel({"id":"_div_973582157","height":"40","width":"100%"});
var _input_1317406206 = new Emp.Label({"id":"_input_1317406206","value":"提 交 代 码 库:","paddingLeft":"20"});
_div_973582157.add(_input_1317406206);
tmp5.add(_div_973582157);
var container = new Emp.Panel({"id":"container","height":"100%","layout":"VBox","width":"100%","paddingLeft":"5"});
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"master","value":"1"}, {"text":"mobile710_ga","value":"2"}]});
container.add(checkbox);
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"pword2016","value":"1"}, {"text":"lcrcbank","value":"2"}, {"text":"noahwm","value":"3"}]});
container.add(checkbox);
tmp5.add(container);
_div_132073067.add(tmp5);
_slidepage_1692235705.add(_div_132073067);
slide.add(_slidepage_1692235705);
Emp.page.add(slide);




	 
Emp.page.render();
