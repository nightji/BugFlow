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
Emp.page.setId('_body_293330712');
var _div_1534306719 = new Emp.Panel({"id":"_div_1534306719","height":"100%","width":"100%","backgroundImage":"/images/bg.jpg"});
var _div_109393057 = new Emp.Panel({"id":"_div_109393057","height":"100%","vAlign":"middle","layout":"VBox","hAlign":"center","width":"100%"});
var _div_323107167 = new Emp.Panel({"id":"_div_323107167","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"10"});
var _input_1623496153 = new Emp.Label({"id":"_input_1623496153","color":"#eaeaea","value":"账号："});
_div_323107167.add(_input_1623496153);
var EMPuserid = new Emp.Text({"id":"EMPuserid","width":"180","emptyText":"请输入账号"});
_div_323107167.add(EMPuserid);
_div_109393057.add(_div_323107167);
var _div_52740926 = new Emp.Panel({"id":"_div_52740926","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
var _input_1653480718 = new Emp.Label({"id":"_input_1653480718","color":"#eaeaea","value":"密码："});
_div_52740926.add(_input_1653480718);
var EMPpassword = new Emp.Text({"id":"EMPpassword","width":"180","emptyText":"请输入密码"});
EMPpassword.setInputType("password");
_div_52740926.add(EMPpassword);
_div_109393057.add(_div_52740926);
var _div_822688970 = new Emp.Panel({"id":"_div_822688970","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
var _input_1433799404 = new Emp.Button({"id":"_input_1433799404","width":"120","value":"登录"});
_input_1433799404.addEvent('onClick',login);
_div_822688970.add(_input_1433799404);
var _input_952580041 = new Emp.Button({"id":"_input_952580041","width":"120","value":"取消"});
_input_952580041.addEvent('onClick',cancel);
_div_822688970.add(_input_952580041);
_div_109393057.add(_div_822688970);
_div_1534306719.add(_div_109393057);
Emp.page.add(_div_1534306719);




 
$jsd('/flows/src/login.htmlx',30,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);});function login() { 
$jsd('/flows/src/login.htmlx',31,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); var userid = EMPuserid.getValue(); 
$jsd('/flows/src/login.htmlx',32,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); var password = EMPpassword.getValue(); 
$jsd('/flows/src/login.htmlx',33,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); user = checkUser(userid, password); 
} 
$jsd('/flows/src/login.htmlx',36,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); function cancel() { 
$jsd('/flows/src/login.htmlx',37,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); EMPuserid.setValue(""); 
$jsd('/flows/src/login.htmlx',38,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); EMPpassword.setValue(""); 
} 
$jsd('/flows/src/login.htmlx',41,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); function checkUser(userid, password) { 
$jsd('/flows/src/login.htmlx',42,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); var ajax = new $M.Ajax(); 
$jsd('/flows/src/login.htmlx',43,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.add("userid", userid); 
$jsd('/flows/src/login.htmlx',44,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.add("password", password); 
$jsd('/flows/src/login.htmlx',45,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.setAction("/CheckUser.jsp"); 
$jsd('/flows/src/login.htmlx',46,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); ajax.submit(function (result) { 
$jsd('/flows/src/login.htmlx',47,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("回传的值:" + result); 
$jsd('/flows/src/login.htmlx',48,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); var user = result.replace(/s/g, ""); 
$jsd('/flows/src/login.htmlx',49,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); user = user.replace(/[\r\n]/g, ""); 
$jsd('/flows/src/login.htmlx',50,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("经过处理后回传的值:" + user); 
if($jsd('/flows/src/login.htmlx',51,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);})||true) if (user == "true") { 
$jsd('/flows/src/login.htmlx',52,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); pref = new $M.Preferences(); 
$jsd('/flows/src/login.htmlx',53,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); pref.open("myPref"); 
$jsd('/flows/src/login.htmlx',54,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); pref.put("userid", userid); 
$jsd('/flows/src/login.htmlx',55,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); pref.put("password", password); 
$jsd('/flows/src/login.htmlx',56,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); $M.page.goTo({"url":"/choosepage.html", "params":userid, "isDestroySelf":true, }); 
} else { 
$jsd('/flows/src/login.htmlx',62,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); alert("用户名或密码错误,请重新输入!!!!!!"); 
} 
}, function (errorCode, errorMsg) { 
$jsd('/flows/src/login.htmlx',65,this,((typeof(arguments)!="undefined"?arguments:null)),function(__text){return eval(__text);}); log("ajax Error : " + errorCode + " " + errorMsg); 
}); 
} 
 
Emp.page.render();
