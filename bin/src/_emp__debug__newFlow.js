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
Emp.page.setId('_body_2114181461');
var nav = new Emp.Panel({"id":"nav","height":"52","backgroundColor":"#474747","width":"100%"});
var _div_243154598 = new Emp.Panel({"id":"_div_243154598","height":"100%","vAlign":"middle","hAlign":"center","width":"100%"});
var _input_37948345 = new Emp.Label({"id":"_input_37948345","color":"#ffffff","value":"提交问题","fontSize":"25"});
_div_243154598.add(_input_37948345);
nav.add(_div_243154598);
var _div_2142674903 = new Emp.Panel({"id":"_div_2142674903","height":"-2","marginTop":"11","marginRight":"11","width":"-2"});
_div_2142674903.addEvent('onClick',save);
var _img_783818178 = new Emp.Image({"id":"_img_783818178","height":"30","width":"30","src":"/flow/save.png"});
_div_2142674903.add(_img_783818178);
nav.add(_div_2142674903);
Emp.page.add(nav);
var _div_967426948 = new Emp.Panel({"id":"_div_967426948","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","overflow":"y","width":"100%"});
var tmp1 = new Emp.Panel({"id":"tmp1","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_1997189652 = new Emp.Label({"id":"_input_1997189652","value":"问   题   类  型:","paddingLeft":"20"});
tmp1.add(_input_1997189652);
var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_701153225","text":"产品级","value":"1"}, {"id":"_option_1039481486","text":"项目级","value":"2"}]});
tmp1.add(select);
_div_967426948.add(tmp1);
var _div_785866857 = new Emp.Panel({"id":"_div_785866857","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_967426948.add(_div_785866857);
var tmp2 = new Emp.Panel({"id":"tmp2","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_310959757 = new Emp.Label({"id":"_input_310959757","value":"问题需求类型:","paddingLeft":"20"});
tmp2.add(_input_310959757);
var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_1368626667","text":" BUG","value":"1"}, {"id":"_option_811049252","text":" 新需求","value":"2"}, {"id":"_option_1226070855","text":"拓展需求","value":"3"}]});
tmp2.add(select2);
_div_967426948.add(tmp2);
var _div_1467267020 = new Emp.Panel({"id":"_div_1467267020","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
_div_967426948.add(_div_1467267020);
var tmp3 = new Emp.Panel({"id":"tmp3","height":"150","vAlign":"middle","layout":"VBox","width":"100%"});
var _div_915289454 = new Emp.Panel({"id":"_div_915289454","height":"80","vAlign":"middle","layout":"HBox","width":"100%"});
var _input_844489917 = new Emp.Label({"id":"_input_844489917","value":"问   题   主  题:","paddingLeft":"20"});
_div_915289454.add(_input_844489917);
var select3 = new Emp.Select({"id":"select3","marginLeft":"50","width":"150","marginRight":"20","name":"IOSOrAndroid","value":"3",items:[ {"id":"_option_1699488588","text":"IOS","value":"1"}, {"id":"_option_1772193416","text":"Android","value":"2"}, {"id":"_option_1804042469","text":"IOS/Android","value":"3"}]});
_div_915289454.add(select3);
tmp3.add(_div_915289454);
var _div_220164490 = new Emp.Panel({"id":"_div_220164490","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","name":"proTitle","width":"100%"});
_div_220164490.add(textarea);
tmp3.add(_div_220164490);
_div_967426948.add(tmp3);
var tmp4 = new Emp.Panel({"id":"tmp4","height":"200","marginTop":"25","layout":"VBox","width":"100%"});
var _div_864051150 = new Emp.Panel({"id":"_div_864051150","height":"40","width":"100%"});
var _input_823257036 = new Emp.Label({"id":"_input_823257036","value":"问   题   描  述:","paddingLeft":"20"});
_div_864051150.add(_input_823257036);
tmp4.add(_div_864051150);
var _div_243866431 = new Emp.Panel({"id":"_div_243866431","text":">","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","name":"proDescript","width":"100%"});
_div_243866431.add(textarea);
tmp4.add(_div_243866431);
_div_967426948.add(tmp4);
var tmp5 = new Emp.Panel({"id":"tmp5","height":"100","marginTop":"25","layout":"VBox","width":"100%"});
var _div_361438332 = new Emp.Panel({"id":"_div_361438332","height":"40","width":"100%"});
var _input_1610292208 = new Emp.Label({"id":"_input_1610292208","paddingTop":"5","value":"客                户 :","paddingLeft":"20"});
_div_361438332.add(_input_1610292208);
tmp5.add(_div_361438332);
var _div_1592220362 = new Emp.Panel({"id":"_div_1592220362","borderColor":"#909090","height":"100%","marginLeft":"20","borderWidth":"1","marginRight":"32","width":"100%"});
var textarea = new Emp.TextArea({"id":"textarea","height":"100%","name":"cusName","width":"100%"});
_div_1592220362.add(textarea);
tmp5.add(_div_1592220362);
_div_967426948.add(tmp5);
var tmp6 = new Emp.Panel({"id":"tmp6","height":"100","marginTop":"35","width":"100%"});
var _div_1362583613 = new Emp.Panel({"id":"_div_1362583613","height":"40","width":"100%"});
var _div_177172083 = new Emp.Panel({"id":"_div_177172083"});
var _input_1318864239 = new Emp.Label({"id":"_input_1318864239","paddingTop":"5","value":"预计开发工作量:","paddingLeft":"20"});
_div_177172083.add(_input_1318864239);
_div_1362583613.add(_div_177172083);
var _div_1972544186 = new Emp.Panel({"id":"_div_1972544186","borderColor":"#909090","height":"40","vAlign":"middle","marginLeft":"20","borderWidth":"1","hAlign":"center","marginRight":"32","width":"100%"});
var text = new Emp.Text({"id":"text","height":"40","name":"effExpected","width":"100%"});
_div_1972544186.add(text);
_div_1362583613.add(_div_1972544186);
tmp6.add(_div_1362583613);
_div_967426948.add(tmp6);
var status = new Emp.Label({"id":"status","name":"status","value":"0","display":"false"});
_div_967426948.add(status);
var person_dealnow = new Emp.Label({"id":"person_dealnow","name":"person_dealNow","display":"false"});
_div_967426948.add(person_dealnow);
Emp.page.add(_div_967426948);
var _div_287189191 = new Emp.Panel({"id":"_div_287189191","height":"50","borderColor":"#909090","borderWidth":"1","width":"100%","layout":"HBox"});
var _div_1392978328 = new Emp.Panel({"id":"_div_1392978328","height":"100%","vAlign":"middle","hAlign":"center","width":"100%"});
var _img_2067522749 = new Emp.Image({"id":"_img_2067522749","src":"/flow/camera.png"});
_div_1392978328.add(_img_2067522749);
_div_287189191.add(_div_1392978328);
var _div_421950336 = new Emp.Panel({"id":"_div_421950336","height":"100%","vAlign":"middle","hAlign":"center","width":"100%"});
var _img_728294758 = new Emp.Image({"id":"_img_728294758","src":"/flow/pic.png"});
_div_421950336.add(_img_728294758);
_div_287189191.add(_div_421950336);
var _div_1940693453 = new Emp.Panel({"id":"_div_1940693453","height":"100%","vAlign":"middle","hAlign":"center","width":"100%"});
var _img_1253233935 = new Emp.Image({"id":"_img_1253233935","src":"/flow/hxz.png"});
_div_1940693453.add(_img_1253233935);
_div_287189191.add(_div_1940693453);
Emp.page.add(_div_287189191);




 
$jsd('/flows/src/newFlow.htmlx',124,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);});function save() { 
$jsd('/flows/src/newFlow.htmlx',126,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); var form = new $M.Form(); 
$jsd('/flows/src/newFlow.htmlx',127,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); form.setAction("/executeProblem.jsp"); 
$jsd('/flows/src/newFlow.htmlx',128,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); form.submit(function (result) { 
}, function (errorCode, errorMsg) { 
$jsd('/flows/src/newFlow.htmlx',131,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("ajax error", errorCode + "  " + errorMsg); 
}); 
} 
 
Emp.page.render();
