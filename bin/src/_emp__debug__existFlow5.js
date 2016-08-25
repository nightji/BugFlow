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
Emp.page.setId('_body_2023046313');
var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
var _div_694082998 = new Emp.Panel({"id":"_div_694082998","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
var _input_321776882 = new Emp.Label({"id":"_input_321776882","color":"#ffffff","value":"解决问题","fontSize":"25"});
_div_694082998.add(_input_321776882);
nav.add(_div_694082998);
Emp.page.add(nav);
var slide = new Emp.SlidePage({"id":"slide"});
var _slidepage_717011725 = new Emp.Panel({"id":"_slidepage_717011725"});
_slidepage_717011725.setWidth("100%");
_slidepage_717011725.setHeight("100%");
var _div_1285318758 = new Emp.Panel({"id":"_div_1285318758","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","overflow":"y","width":"100%"});
var tmp1 = new Emp.Panel({"id":"tmp1","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_1044195800 = new Emp.Label({"id":"_input_1044195800","value":"问   题   类  型:","paddingLeft":"20"});
tmp1.add(_input_1044195800);
var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_1976509565","text":"产品级","value":"1"}, {"id":"_option_1919207159","text":"项目级","value":"2"}]});
tmp1.add(select);
_div_1285318758.add(tmp1);
var _div_910343373 = new Emp.Panel({"id":"_div_910343373","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1285318758.add(_div_910343373);
var tmp2 = new Emp.Panel({"id":"tmp2","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_1578850086 = new Emp.Label({"id":"_input_1578850086","value":"问题需求类型:","paddingLeft":"20"});
tmp2.add(_input_1578850086);
var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_262181558","text":" BUG","value":"1"}, {"id":"_option_1996485309","text":" 新需求","value":"2"}, {"id":"_option_496603988","text":"拓展需求","value":"3"}]});
tmp2.add(select2);
_div_1285318758.add(tmp2);
var _div_1301774074 = new Emp.Panel({"id":"_div_1301774074","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1285318758.add(_div_1301774074);
var tmp3 = new Emp.Panel({"id":"tmp3","height":"150","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_764672572 = new Emp.Panel({"id":"_div_764672572","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_1309773956 = new Emp.Label({"id":"_input_1309773956","value":"问   题   主  题:","paddingLeft":"20"});
_div_764672572.add(_input_1309773956);
var select3 = new Emp.Select({"id":"select3","marginLeft":"50","width":"150","marginRight":"20","name":"iosOrAndroid","value":"3",items:[ {"id":"_option_300142501","text":"IOS","value":"1"}, {"id":"_option_55927504","text":"Android","value":"2"}, {"id":"_option_1523205989","text":"IOS/Android","value":"3"}]});
_div_764672572.add(select3);
tmp3.add(_div_764672572);
var _div_370501236 = new Emp.Panel({"id":"_div_370501236","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_370501236.add(textarea);
tmp3.add(_div_370501236);
_div_1285318758.add(tmp3);
var tmp4 = new Emp.Panel({"id":"tmp4","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1721075093 = new Emp.Panel({"id":"_div_1721075093","height":"40","width":"100%"});
var _input_1651846608 = new Emp.Label({"id":"_input_1651846608","value":"问   题   描  述:","paddingLeft":"20"});
_div_1721075093.add(_input_1651846608);
tmp4.add(_div_1721075093);
var _div_2064835887 = new Emp.Panel({"id":"_div_2064835887","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_2064835887.add(textarea);
tmp4.add(_div_2064835887);
_div_1285318758.add(tmp4);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"100","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1452777456 = new Emp.Panel({"id":"_div_1452777456","height":"40","width":"100%"});
var _input_2089120249 = new Emp.Label({"id":"_input_2089120249","value":"客                户:","paddingLeft":"20"});
_div_1452777456.add(_input_2089120249);
tmp5.add(_div_1452777456);
var _div_486396493 = new Emp.Panel({"id":"_div_486396493","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_486396493.add(textarea);
tmp5.add(_div_486396493);
_div_1285318758.add(tmp5);
var tmp6 = new Emp.Panel({"id":"tmp6","marginBottom":"30","height":"80","marginTop":"15","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1734735623 = new Emp.Panel({"id":"_div_1734735623","height":"40","width":"100%"});
var _input_1463624089 = new Emp.Label({"id":"_input_1463624089","value":"预计开发工作量:","paddingLeft":"20"});
_div_1734735623.add(_input_1463624089);
tmp6.add(_div_1734735623);
var _div_1852371085 = new Emp.Panel({"id":"_div_1852371085","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1852371085.add(textarea);
tmp6.add(_div_1852371085);
_div_1285318758.add(tmp6);
_slidepage_717011725.add(_div_1285318758);
slide.add(_slidepage_717011725);
var _slidepage_732843800 = new Emp.Panel({"id":"_slidepage_732843800"});
_slidepage_732843800.setWidth("100%");
_slidepage_732843800.setHeight("100%");
var _div_1087031055 = new Emp.Panel({"id":"_div_1087031055","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp7 = new Emp.Panel({"id":"tmp7","height":"80","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1326355675 = new Emp.Panel({"id":"_div_1326355675","height":"40","width":"100%"});
var _input_1179573865 = new Emp.Label({"id":"_input_1179573865","value":"Bug            号:","paddingLeft":"20"});
_div_1326355675.add(_input_1179573865);
tmp7.add(_div_1326355675);
var _div_1676403598 = new Emp.Panel({"id":"_div_1676403598","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1676403598.add(textarea);
tmp7.add(_div_1676403598);
_div_1087031055.add(tmp7);
var _div_678960515 = new Emp.Panel({"id":"_div_678960515","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1087031055.add(_div_678960515);
var tmp8 = new Emp.Panel({"id":"tmp8","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_815281527 = new Emp.Panel({"id":"_div_815281527","height":"40","width":"100%"});
var _input_1490956429 = new Emp.Label({"id":"_input_1490956429","value":"问 题 修 改 人:","paddingLeft":"20"});
_div_815281527.add(_input_1490956429);
tmp8.add(_div_815281527);
var _div_1665509007 = new Emp.Panel({"id":"_div_1665509007","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1665509007.add(textarea);
tmp8.add(_div_1665509007);
_div_1087031055.add(tmp8);
var _div_1961299353 = new Emp.Panel({"id":"_div_1961299353","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1087031055.add(_div_1961299353);
var tmp9 = new Emp.Panel({"id":"tmp9","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1675559131 = new Emp.Panel({"id":"_div_1675559131","height":"40","width":"100%"});
var _input_1169251606 = new Emp.Label({"id":"_input_1169251606","value":"开发提交时间:","paddingLeft":"20"});
_div_1675559131.add(_input_1169251606);
tmp9.add(_div_1675559131);
var _div_2136371992 = new Emp.Panel({"id":"_div_2136371992","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_2136371992.add(textarea);
tmp9.add(_div_2136371992);
_div_1087031055.add(tmp9);
var tmp10 = new Emp.Panel({"id":"tmp10","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_737886007 = new Emp.Panel({"id":"_div_737886007","height":"40","width":"100%"});
var _input_2079541871 = new Emp.Label({"id":"_input_2079541871","value":"修   改   描  述:","paddingLeft":"20"});
_div_737886007.add(_input_2079541871);
tmp10.add(_div_737886007);
var _div_563870972 = new Emp.Panel({"id":"_div_563870972","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_563870972.add(textarea);
tmp10.add(_div_563870972);
_div_1087031055.add(tmp10);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"140","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1018952127 = new Emp.Panel({"id":"_div_1018952127","height":"40","width":"100%"});
var _input_1493797311 = new Emp.Label({"id":"_input_1493797311","value":"提 交 代 码 库:","paddingLeft":"20"});
_div_1018952127.add(_input_1493797311);
tmp5.add(_div_1018952127);
var container = new Emp.Panel({"id":"container","height":"100%","layout":"VBox","width":"100%","paddingLeft":"20"});
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"master","value":"1"}, {"text":"lcrcbank","value":"2"}, {"text":"noahwm","value":"3"}]});
container.add(checkbox);
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"pword2016","value":"1"}, {"text":"mobile710_ga","value":"2"}]});
container.add(checkbox);
tmp5.add(container);
_div_1087031055.add(tmp5);
var tmp12 = new Emp.Panel({"id":"tmp12","height":"80","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1218076601 = new Emp.Panel({"id":"_div_1218076601","height":"40","width":"100%"});
var _input_251826156 = new Emp.Label({"id":"_input_251826156","value":"提交客户版本号:","paddingLeft":"20"});
_div_1218076601.add(_input_251826156);
tmp12.add(_div_1218076601);
var _div_1899419302 = new Emp.Panel({"id":"_div_1899419302","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1899419302.add(textarea);
tmp12.add(_div_1899419302);
_div_1087031055.add(tmp12);
var tmp12 = new Emp.Panel({"id":"tmp12","height":"80","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1441337595 = new Emp.Panel({"id":"_div_1441337595","height":"40","width":"100%"});
var _input_945421005 = new Emp.Label({"id":"_input_945421005","value":"修改文档名称:","paddingLeft":"20"});
_div_1441337595.add(_input_945421005);
tmp12.add(_div_1441337595);
var _div_459326882 = new Emp.Panel({"id":"_div_459326882","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_459326882.add(textarea);
tmp12.add(_div_459326882);
_div_1087031055.add(tmp12);
var tmp13 = new Emp.Panel({"id":"tmp13","marginBottom":"30","height":"-2","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1431190494 = new Emp.Panel({"id":"_div_1431190494","height":"40","width":"100%"});
var _input_54302611 = new Emp.Label({"id":"_input_54302611","value":"使   用   说  明:","paddingLeft":"20"});
_div_1431190494.add(_input_54302611);
tmp13.add(_div_1431190494);
var _div_2130916749 = new Emp.Panel({"id":"_div_2130916749","borderColor":"#909090","height":"150","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_2130916749.add(textarea);
tmp13.add(_div_2130916749);
_div_1087031055.add(tmp13);
_slidepage_732843800.add(_div_1087031055);
slide.add(_slidepage_732843800);
var _slidepage_1891259976 = new Emp.Panel({"id":"_slidepage_1891259976"});
_slidepage_1891259976.setWidth("100%");
_slidepage_1891259976.setHeight("100%");
var _div_1500957385 = new Emp.Panel({"id":"_div_1500957385","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp16 = new Emp.Panel({"id":"tmp16","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1116800607 = new Emp.Panel({"id":"_div_1116800607","height":"40","width":"100%"});
var _input_1060727069 = new Emp.Label({"id":"_input_1060727069","value":"测  试  人  员  :","paddingLeft":"20"});
_div_1116800607.add(_input_1060727069);
tmp16.add(_div_1116800607);
var _div_1378094936 = new Emp.Panel({"id":"_div_1378094936","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1378094936.add(textarea);
tmp16.add(_div_1378094936);
_div_1500957385.add(tmp16);
var _div_1573543391 = new Emp.Panel({"id":"_div_1573543391","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1500957385.add(_div_1573543391);
var tmp17 = new Emp.Panel({"id":"tmp17","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_428288560 = new Emp.Panel({"id":"_div_428288560","height":"40","width":"100%"});
var _input_2028126823 = new Emp.Label({"id":"_input_2028126823","value":"测试截止时间:","paddingLeft":"20"});
_div_428288560.add(_input_2028126823);
tmp17.add(_div_428288560);
var _div_1867068977 = new Emp.Panel({"id":"_div_1867068977","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1867068977.add(textarea);
tmp17.add(_div_1867068977);
_div_1500957385.add(tmp17);
var _div_1171031692 = new Emp.Panel({"id":"_div_1171031692","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1500957385.add(_div_1171031692);
var tmp18 = new Emp.Panel({"id":"tmp18","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1312605362 = new Emp.Panel({"id":"_div_1312605362","height":"40","width":"100%"});
var _input_2006297150 = new Emp.Label({"id":"_input_2006297150","value":"测   试   用  例:","paddingLeft":"20"});
_div_1312605362.add(_input_2006297150);
tmp18.add(_div_1312605362);
var _div_47974856 = new Emp.Panel({"id":"_div_47974856","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_47974856.add(textarea);
tmp18.add(_div_47974856);
_div_1500957385.add(tmp18);
_slidepage_1891259976.add(_div_1500957385);
slide.add(_slidepage_1891259976);
Emp.page.add(slide);




	 
Emp.page.render();
