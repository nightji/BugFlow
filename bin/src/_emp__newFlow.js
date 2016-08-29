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
		

	function save() {

		var form = new $M.Form();
		form.setAction("/executeProblem.jsp");
		form.submit(function(result) {

		}, function(errorCode, errorMsg) {
			log("ajax error", errorCode + "  " + errorMsg);
		});

	};


     Emp.page.render();