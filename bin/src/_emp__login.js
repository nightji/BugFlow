Emp.page.setId('_body_206660528');
var _div_862436897 = new Emp.Panel({"id":"_div_862436897","height":"100%","width":"100%","backgroundImage":"/images/bg.jpg"});
    var _div_1609794276 = new Emp.Panel({"id":"_div_1609794276","height":"100%","vAlign":"middle","layout":"VBox","hAlign":"center","width":"100%"});
    var _div_1813411826 = new Emp.Panel({"id":"_div_1813411826","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"10"});
    var _input_924641358 = new Emp.Label({"id":"_input_924641358","color":"#eaeaea","value":"账号："});
            _div_1813411826.add(_input_924641358);
        var name = new Emp.Text({"id":"name","width":"180","emptyText":"请输入账号"});
            _div_1813411826.add(name);
                _div_1609794276.add(_div_1813411826);
        var _div_122435629 = new Emp.Panel({"id":"_div_122435629","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_486282777 = new Emp.Label({"id":"_input_486282777","color":"#eaeaea","value":"密码："});
            _div_122435629.add(_input_486282777);
        var password = new Emp.Text({"id":"password","width":"180","emptyText":"请输入密码"});
password.setInputType("password");
            _div_122435629.add(password);
                _div_1609794276.add(_div_122435629);
        var _div_1929936153 = new Emp.Panel({"id":"_div_1929936153","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_843919183 = new Emp.Button({"id":"_input_843919183","width":"120","value":"登录"});
	_input_843919183.addEvent('onClick',login);
            _div_1929936153.add(_input_843919183);
        var _input_1767703893 = new Emp.Button({"id":"_input_1767703893","width":"120","value":"取消"});
	_input_1767703893.addEvent('onClick',cancel);
            _div_1929936153.add(_input_1767703893);
                _div_1609794276.add(_div_1929936153);
                _div_862436897.add(_div_1609794276);
        Emp.page.add(_div_862436897);
		

	function login() {

	}
	function cancel() {

	}


     Emp.page.render();