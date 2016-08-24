Emp.page.setId('_body_1312593373');
var _div_1804798027 = new Emp.Panel({"id":"_div_1804798027","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","width":"100%"});
    var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
    var _div_1109670143 = new Emp.Panel({"id":"_div_1109670143","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
    var _input_1478102853 = new Emp.Label({"id":"_input_1478102853","color":"#ffffff","value":"提交问题","fontSize":"25"});
            _div_1109670143.add(_input_1478102853);
                nav.add(_div_1109670143);
                _div_1804798027.add(nav);
        var _div_383821875 = new Emp.Panel({"id":"_div_383821875","marginTop":"25"});
    var _input_2000861184 = new Emp.Label({"id":"_input_2000861184","value":"问   题   类  型:","paddingLeft":"20"});
            _div_383821875.add(_input_2000861184);
        var select = new Emp.Select({"id":"select","marginLeft":"50","width":"150","marginRight":"20","name":"proType","value":"1",items:[ {"id":"_option_1127164278","text":"产品级","value":"1"}, {"id":"_option_1296770159","text":"项目级","value":"2"}]});
            _div_383821875.add(select);
                _div_1804798027.add(_div_383821875);
        var _div_4528910 = new Emp.Panel({"id":"_div_4528910","marginTop":"25"});
    var _input_955462725 = new Emp.Label({"id":"_input_955462725","value":"问题需求类型:","paddingLeft":"20"});
            _div_4528910.add(_input_955462725);
        var select2 = new Emp.Select({"id":"select2","marginLeft":"50","width":"150","marginRight":"20","name":"reqType","value":"1",items:[ {"id":"_option_1073188434","text":" BUG","value":"1"}, {"id":"_option_362859085","text":" 新需求","value":"2"}, {"id":"_option_1866567762","text":"拓展需求","value":"3"}]});
            _div_4528910.add(select2);
                _div_1804798027.add(_div_4528910);
        var _div_963260558 = new Emp.Panel({"id":"_div_963260558","marginTop":"25"});
    var _input_1788467220 = new Emp.Label({"id":"_input_1788467220","marginTop":"10","value":"问   题   主  题:","paddingLeft":"20"});
            _div_963260558.add(_input_1788467220);
        var textarea = new Emp.TextArea({"id":"textarea","marginLeft":"50","width":"150","name":"proTheme"});
            _div_963260558.add(textarea);
                _div_1804798027.add(_div_963260558);
        var _div_612800546 = new Emp.Panel({"id":"_div_612800546","marginTop":"25"});
    var _input_7205610 = new Emp.Label({"id":"_input_7205610","marginTop":"10","value":"问   题   描  述:","paddingLeft":"20"});
            _div_612800546.add(_input_7205610);
        var textarea = new Emp.TextArea({"id":"textarea","marginLeft":"50","width":"150","name":"proDescript"});
            _div_612800546.add(textarea);
                _div_1804798027.add(_div_612800546);
        var _div_3483820 = new Emp.Panel({"id":"_div_3483820","marginTop":"25"});
    var _input_570504271 = new Emp.Label({"id":"_input_570504271","marginTop":"10","value":"客                户:","paddingLeft":"20"});
            _div_3483820.add(_input_570504271);
        var text = new Emp.TextArea({"id":"text","paddingTop":"5","marginLeft":"50","width":"150","name":"cusName"});
            _div_3483820.add(text);
                _div_1804798027.add(_div_3483820);
        var _div_2004825236 = new Emp.Panel({"id":"_div_2004825236","marginTop":"25"});
    var _input_1079320022 = new Emp.Label({"id":"_input_1079320022","marginTop":"10","value":"预 计 工 作 量:","paddingLeft":"20"});
            _div_2004825236.add(_input_1079320022);
        var text = new Emp.TextArea({"id":"text","paddingTop":"5","marginLeft":"50","width":"150","name":"effExpected"});
            _div_2004825236.add(text);
                _div_1804798027.add(_div_2004825236);
        var _div_842916382 = new Emp.Panel({"id":"_div_842916382","marginTop":"50"});
    var _input_2093496662 = new Emp.Button({"id":"_input_2093496662","color":"#0000FF","marginLeft":"90","value":"提交"});
	_input_2093496662.addEvent('onClick',login);
            _div_842916382.add(_input_2093496662);
        var _input_1026325786 = new Emp.Button({"id":"_input_1026325786","color":"#FF0000","marginLeft":"40","value":"取消"});
	_input_1026325786.addEvent('onClick',login);
            _div_842916382.add(_input_1026325786);
                _div_1804798027.add(_div_842916382);
        Emp.page.add(_div_1804798027);
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