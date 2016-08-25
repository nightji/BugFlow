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
Emp.page.setId('_body_979312368');
var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
var _div_1692145078 = new Emp.Panel({"id":"_div_1692145078","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
var _input_756388725 = new Emp.Label({"id":"_input_756388725","color":"#ffffff","value":"解决问题","fontSize":"25"});
_div_1692145078.add(_input_756388725);
nav.add(_div_1692145078);
Emp.page.add(nav);
var slide = new Emp.SlidePage({"id":"slide"});
var _slidepage_1853127272 = new Emp.Panel({"id":"_slidepage_1853127272"});
_slidepage_1853127272.setWidth("100%");
_slidepage_1853127272.setHeight("100%");
var _div_554728063 = new Emp.Panel({"id":"_div_554728063","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","overflow":"y","width":"100%"});
var tmp1 = new Emp.Panel({"id":"tmp1","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_919043493 = new Emp.Label({"id":"_input_919043493","value":"问   题   类  型:","paddingLeft":"20"});
tmp1.add(_input_919043493);
var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_593971401","text":"产品级","value":"1"}, {"id":"_option_1373345351","text":"项目级","value":"2"}]});
tmp1.add(select);
_div_554728063.add(tmp1);
var _div_661076301 = new Emp.Panel({"id":"_div_661076301","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_554728063.add(_div_661076301);
var tmp2 = new Emp.Panel({"id":"tmp2","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_917847391 = new Emp.Label({"id":"_input_917847391","value":"问题需求类型:","paddingLeft":"20"});
tmp2.add(_input_917847391);
var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_1428325454","text":" BUG","value":"1"}, {"id":"_option_1293699212","text":" 新需求","value":"2"}, {"id":"_option_2078213856","text":"拓展需求","value":"3"}]});
tmp2.add(select2);
_div_554728063.add(tmp2);
var _div_1866242984 = new Emp.Panel({"id":"_div_1866242984","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_554728063.add(_div_1866242984);
var tmp3 = new Emp.Panel({"id":"tmp3","height":"150","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_543447338 = new Emp.Panel({"id":"_div_543447338","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_471459075 = new Emp.Label({"id":"_input_471459075","value":"问   题   主  题:","paddingLeft":"20"});
_div_543447338.add(_input_471459075);
var select3 = new Emp.Select({"id":"select3","marginLeft":"50","width":"150","marginRight":"20","name":"iosOrAndroid","value":"3",items:[ {"id":"_option_1987545774","text":"IOS","value":"1"}, {"id":"_option_573694533","text":"Android","value":"2"}, {"id":"_option_2029924748","text":"IOS/Android","value":"3"}]});
_div_543447338.add(select3);
tmp3.add(_div_543447338);
var _div_2020023394 = new Emp.Panel({"id":"_div_2020023394","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_2020023394.add(textarea);
tmp3.add(_div_2020023394);
_div_554728063.add(tmp3);
var tmp4 = new Emp.Panel({"id":"tmp4","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_998310493 = new Emp.Panel({"id":"_div_998310493","height":"40","width":"100%"});
var _input_314721840 = new Emp.Label({"id":"_input_314721840","value":"问   题   描  述:","paddingLeft":"20"});
_div_998310493.add(_input_314721840);
tmp4.add(_div_998310493);
var _div_1533190502 = new Emp.Panel({"id":"_div_1533190502","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_1533190502.add(textarea);
tmp4.add(_div_1533190502);
_div_554728063.add(tmp4);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"100","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_13055494 = new Emp.Panel({"id":"_div_13055494","height":"40","width":"100%"});
var _input_97551164 = new Emp.Label({"id":"_input_97551164","value":"客                户:","paddingLeft":"20"});
_div_13055494.add(_input_97551164);
tmp5.add(_div_13055494);
var _div_1513375806 = new Emp.Panel({"id":"_div_1513375806","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_1513375806.add(textarea);
tmp5.add(_div_1513375806);
_div_554728063.add(tmp5);
var tmp6 = new Emp.Panel({"id":"tmp6","marginBottom":"30","height":"80","marginTop":"15","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1062570827 = new Emp.Panel({"id":"_div_1062570827","height":"40","width":"100%"});
var _input_153880937 = new Emp.Label({"id":"_input_153880937","value":"预计开发工作量:","paddingLeft":"20"});
_div_1062570827.add(_input_153880937);
tmp6.add(_div_1062570827);
var _div_706597171 = new Emp.Panel({"id":"_div_706597171","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_706597171.add(textarea);
tmp6.add(_div_706597171);
_div_554728063.add(tmp6);
_slidepage_1853127272.add(_div_554728063);
slide.add(_slidepage_1853127272);
var _slidepage_2107881063 = new Emp.Panel({"id":"_slidepage_2107881063"});
_slidepage_2107881063.setWidth("100%");
_slidepage_2107881063.setHeight("100%");
var _div_119301282 = new Emp.Panel({"id":"_div_119301282","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp7 = new Emp.Panel({"id":"tmp7","height":"80","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1625482196 = new Emp.Panel({"id":"_div_1625482196","height":"40","width":"100%"});
var _input_1339794685 = new Emp.Label({"id":"_input_1339794685","value":"Bug            号:","paddingLeft":"20"});
_div_1625482196.add(_input_1339794685);
tmp7.add(_div_1625482196);
var _div_1563232000 = new Emp.Panel({"id":"_div_1563232000","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1563232000.add(textarea);
tmp7.add(_div_1563232000);
_div_119301282.add(tmp7);
var _div_1362831887 = new Emp.Panel({"id":"_div_1362831887","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_119301282.add(_div_1362831887);
var tmp8 = new Emp.Panel({"id":"tmp8","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_57890739 = new Emp.Panel({"id":"_div_57890739","height":"40","width":"100%"});
var _input_159558282 = new Emp.Label({"id":"_input_159558282","value":"问 题 修 改 人:","paddingLeft":"20"});
_div_57890739.add(_input_159558282);
tmp8.add(_div_57890739);
var _div_1636454118 = new Emp.Panel({"id":"_div_1636454118","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1636454118.add(textarea);
tmp8.add(_div_1636454118);
_div_119301282.add(tmp8);
var _div_170716297 = new Emp.Panel({"id":"_div_170716297","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_119301282.add(_div_170716297);
var tmp9 = new Emp.Panel({"id":"tmp9","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_230579285 = new Emp.Panel({"id":"_div_230579285","height":"40","width":"100%"});
var _input_1285543807 = new Emp.Label({"id":"_input_1285543807","value":"开发提交时间:","paddingLeft":"20"});
_div_230579285.add(_input_1285543807);
tmp9.add(_div_230579285);
var _div_301791782 = new Emp.Panel({"id":"_div_301791782","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_301791782.add(textarea);
tmp9.add(_div_301791782);
_div_119301282.add(tmp9);
var tmp10 = new Emp.Panel({"id":"tmp10","height":"200","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1447239114 = new Emp.Panel({"id":"_div_1447239114","height":"40","width":"100%"});
var _input_1348003076 = new Emp.Label({"id":"_input_1348003076","value":"修   改   描  述:","paddingLeft":"20"});
_div_1447239114.add(_input_1348003076);
tmp10.add(_div_1447239114);
var _div_2082706129 = new Emp.Panel({"id":"_div_2082706129","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_2082706129.add(textarea);
tmp10.add(_div_2082706129);
_div_119301282.add(tmp10);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"140","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1375711172 = new Emp.Panel({"id":"_div_1375711172","height":"40","width":"100%"});
var _input_1768724202 = new Emp.Label({"id":"_input_1768724202","value":"提 交 代 码 库:","paddingLeft":"20"});
_div_1375711172.add(_input_1768724202);
tmp5.add(_div_1375711172);
var container = new Emp.Panel({"id":"container","height":"100%","layout":"VBox","width":"100%","paddingLeft":"20"});
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"master","value":"1"}, {"text":"lcrcbank","value":"2"}, {"text":"noahwm","value":"3"}]});
container.add(checkbox);
var checkbox = new Emp.CheckBox({"id":"checkbox",items:[ {"text":"pword2016","value":"1"}, {"text":"mobile710_ga","value":"2"}]});
container.add(checkbox);
tmp5.add(container);
_div_119301282.add(tmp5);
var tmp12 = new Emp.Panel({"id":"tmp12","height":"80","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_565129962 = new Emp.Panel({"id":"_div_565129962","height":"40","width":"100%"});
var _input_1966584300 = new Emp.Label({"id":"_input_1966584300","value":"提交客户版本号:","paddingLeft":"20"});
_div_565129962.add(_input_1966584300);
tmp12.add(_div_565129962);
var _div_461519123 = new Emp.Panel({"id":"_div_461519123","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_461519123.add(textarea);
tmp12.add(_div_461519123);
_div_119301282.add(tmp12);
var tmp12 = new Emp.Panel({"id":"tmp12","height":"80","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1360611644 = new Emp.Panel({"id":"_div_1360611644","height":"40","width":"100%"});
var _input_1394027452 = new Emp.Label({"id":"_input_1394027452","value":"修改文档名称:","paddingLeft":"20"});
_div_1360611644.add(_input_1394027452);
tmp12.add(_div_1360611644);
var _div_372796994 = new Emp.Panel({"id":"_div_372796994","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_372796994.add(textarea);
tmp12.add(_div_372796994);
_div_119301282.add(tmp12);
var tmp13 = new Emp.Panel({"id":"tmp13","marginBottom":"30","height":"-2","marginTop":"15","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_1642201938 = new Emp.Panel({"id":"_div_1642201938","height":"40","width":"100%"});
var _input_1028140722 = new Emp.Label({"id":"_input_1028140722","value":"使   用   说  明:","paddingLeft":"20"});
_div_1642201938.add(_input_1028140722);
tmp13.add(_div_1642201938);
var _div_1307690892 = new Emp.Panel({"id":"_div_1307690892","borderColor":"#909090","height":"150","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","width":"100%"});
_div_1307690892.add(textarea);
tmp13.add(_div_1307690892);
_div_119301282.add(tmp13);
_slidepage_2107881063.add(_div_119301282);
slide.add(_slidepage_2107881063);
var _slidepage_1092304859 = new Emp.Panel({"id":"_slidepage_1092304859"});
_slidepage_1092304859.setWidth("100%");
_slidepage_1092304859.setHeight("100%");
var _div_1677550657 = new Emp.Panel({"id":"_div_1677550657","height":"100%","backgroundColor":"#eaeaea","overflow":"y","layout":"VBox","width":"100%"});
var tmp16 = new Emp.Panel({"id":"tmp16","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1975460199 = new Emp.Panel({"id":"_div_1975460199","height":"40","width":"100%"});
var _input_1462381973 = new Emp.Label({"id":"_input_1462381973","value":"测  试  人  员  :","paddingLeft":"20"});
_div_1975460199.add(_input_1462381973);
tmp16.add(_div_1975460199);
var _div_303480296 = new Emp.Panel({"id":"_div_303480296","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_303480296.add(textarea);
tmp16.add(_div_303480296);
_div_1677550657.add(tmp16);
var _div_1891661182 = new Emp.Panel({"id":"_div_1891661182","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_1677550657.add(_div_1891661182);
var tmp17 = new Emp.Panel({"id":"tmp17","height":"80","marginTop":"0","vAlign":"middle","hAlign":"center","layout":"HBox","width":"100%"});
var _div_1710615549 = new Emp.Panel({"id":"_div_1710615549","height":"40","width":"100%"});
var _input_1951949654 = new Emp.Label({"id":"_input_1951949654","value":"测试截止时间:","paddingLeft":"20"});
_div_1710615549.add(_input_1951949654);
tmp17.add(_div_1710615549);
var _div_1457643206 = new Emp.Panel({"id":"_div_1457643206","borderColor":"#909090","height":"40","marginTop":"-5","vAlign":"middle","marginLeft":"5","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var textarea = new Emp.Text({"id":"textarea","height":"40","width":"100%"});
_div_1457643206.add(textarea);
tmp17.add(_div_1457643206);
_div_1677550657.add(tmp17);
_slidepage_1092304859.add(_div_1677550657);
slide.add(_slidepage_1092304859);
Emp.page.add(slide);




	 
Emp.page.render();
