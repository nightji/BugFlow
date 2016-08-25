Emp.page.setId('_body_1786446481');
var _div_837137460 = new Emp.Panel({"id":"_div_837137460","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","width":"100%"});
    var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
    var _div_1003006398 = new Emp.Panel({"id":"_div_1003006398","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
    var _input_185465881 = new Emp.Label({"id":"_input_185465881","color":"#ffffff","value":"提交问题","fontSize":"25"});
            _div_1003006398.add(_input_185465881);
                nav.add(_div_1003006398);
                _div_837137460.add(nav);
        var _div_1638022532 = new Emp.Panel({"id":"_div_1638022532","marginTop":"25"});
    var _input_1692107048 = new Emp.Label({"id":"_input_1692107048","value":"问   题   类  型:","paddingLeft":"20"});
            _div_1638022532.add(_input_1692107048);
        var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_413447627","text":"产品级","value":"1"}, {"id":"_option_880697902","text":"项目级","value":"2"}]});
            _div_1638022532.add(select);
                _div_837137460.add(_div_1638022532);
        var _div_110395660 = new Emp.Panel({"id":"_div_110395660","marginTop":"25"});
    var _input_2141470259 = new Emp.Label({"id":"_input_2141470259","value":"问题需求类型:","paddingLeft":"20"});
            _div_110395660.add(_input_2141470259);
        var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_1719045870","text":" BUG","value":"1"}, {"id":"_option_1008009934","text":" 新需求","value":"2"}, {"id":"_option_310738707","text":"拓展需求","value":"3"}]});
            _div_110395660.add(select2);
                _div_837137460.add(_div_110395660);
        var _div_2052702692 = new Emp.Panel({"id":"_div_2052702692","marginTop":"25"});
    var _input_449355389 = new Emp.Label({"id":"_input_449355389","marginTop":"10","value":"问   题   主  题:","paddingLeft":"20"});
            _div_2052702692.add(_input_449355389);
        var textarea = new Emp.TextArea({"id":"textarea","marginLeft":"50","width":"150","name":"proTheme"});
            _div_2052702692.add(textarea);
                _div_837137460.add(_div_2052702692);
        var _div_746427778 = new Emp.Panel({"id":"_div_746427778","marginTop":"25"});
    var _input_1990155396 = new Emp.Label({"id":"_input_1990155396","marginTop":"10","value":"问   题   描  述:","paddingLeft":"20"});
            _div_746427778.add(_input_1990155396);
        var textarea = new Emp.TextArea({"id":"textarea","marginLeft":"50","width":"150","name":"proDescript"});
            _div_746427778.add(textarea);
                _div_837137460.add(_div_746427778);
        var _div_1983339570 = new Emp.Panel({"id":"_div_1983339570","marginTop":"25"});
    var _input_374990230 = new Emp.Label({"id":"_input_374990230","marginTop":"10","value":"客                户:","paddingLeft":"20"});
            _div_1983339570.add(_input_374990230);
        var text = new Emp.TextArea({"id":"text","paddingTop":"5","marginLeft":"50","width":"150","name":"cusName"});
            _div_1983339570.add(text);
                _div_837137460.add(_div_1983339570);
        var _div_986778594 = new Emp.Panel({"id":"_div_986778594","marginTop":"25"});
    var _input_1378219475 = new Emp.Label({"id":"_input_1378219475","marginTop":"10","value":"预 计 工 作 量:","paddingLeft":"20"});
            _div_986778594.add(_input_1378219475);
        var text = new Emp.TextArea({"id":"text","paddingTop":"5","marginLeft":"50","width":"150","name":"effExpected"});
            _div_986778594.add(text);
                _div_837137460.add(_div_986778594);
        var _div_60595582 = new Emp.Panel({"id":"_div_60595582","marginTop":"50"});
    var _input_1777102542 = new Emp.Button({"id":"_input_1777102542","color":"#0000FF","marginLeft":"90","value":"提交"});
	_input_1777102542.addEvent('onClick',login);
            _div_60595582.add(_input_1777102542);
        var _input_1456591319 = new Emp.Button({"id":"_input_1456591319","color":"#FF0000","marginLeft":"40","value":"取消"});
	_input_1456591319.addEvent('onClick',login);
            _div_60595582.add(_input_1456591319);
                _div_837137460.add(_div_60595582);
        Emp.page.add(_div_837137460);
	var dialog = new Emp.CustomDialog({"id":"dialog"});

	var div = new Emp.Panel({"id":"div"});
    var textarea = new Emp.TextArea({"id":"textarea","height":"100%","hidden":"true","width":"100%","value":""});
            div.add(textarea);
                dialog.setView(div);
        	


	function buttonClick(){
			dialog.show();
		}
		
	function login(){
		alert("提交数据中......");
		var form = new $M.Form();//创建form对象
		form.setAction("/submitProblem.jsp");	//设置form请求地址
		form.submit(function(result){		//form请求成功的回调函数，result为返回的数据
						
		}, function(errorCode,errorMsg){	//form请求失败的回调函数
			log("ajax Error : "+errorCode+" "+errorMsg);//在控制台打印
		})
	}


     Emp.page.render();