Emp.page.setId('_body_1134990017');
var _div_1827463065 = new Emp.Panel({"id":"_div_1827463065","height":"100%","width":"100%","backgroundImage":"/images/bg.jpg"});
    var _div_860614061 = new Emp.Panel({"id":"_div_860614061","height":"100%","vAlign":"middle","layout":"VBox","hAlign":"center","width":"100%"});
    var _div_1038160682 = new Emp.Panel({"id":"_div_1038160682","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"10"});
    var _input_61950499 = new Emp.Label({"id":"_input_61950499","color":"#eaeaea","value":"账号："});
            _div_1038160682.add(_input_61950499);
        var EMPuserid = new Emp.Text({"id":"EMPuserid","width":"180","emptyText":"请输入账号"});
            _div_1038160682.add(EMPuserid);
                _div_860614061.add(_div_1038160682);
        var _div_1316032594 = new Emp.Panel({"id":"_div_1316032594","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_1625726905 = new Emp.Label({"id":"_input_1625726905","color":"#eaeaea","value":"密码："});
            _div_1316032594.add(_input_1625726905);
        var EMPpassword = new Emp.Text({"id":"EMPpassword","width":"180","emptyText":"请输入密码"});
EMPpassword.setInputType("password");
            _div_1316032594.add(EMPpassword);
                _div_860614061.add(_div_1316032594);
        var _div_447826258 = new Emp.Panel({"id":"_div_447826258","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_1833219118 = new Emp.Button({"id":"_input_1833219118","width":"120","value":"登录"});
	_input_1833219118.addEvent('onClick',login);
            _div_447826258.add(_input_1833219118);
        var _input_965832717 = new Emp.Button({"id":"_input_965832717","width":"120","value":"取消"});
	_input_965832717.addEvent('onClick',cancel);
            _div_447826258.add(_input_965832717);
                _div_860614061.add(_div_447826258);
                _div_1827463065.add(_div_860614061);
        Emp.page.add(_div_1827463065);
		

	function login() {	
		var userid = EMPuserid.getValue();
		var password = EMPpassword.getValue();
		user = checkUser(userid, password);
	}
	
	function cancel() {
		EMPuserid.setValue("");
		EMPpassword.setValue("");
	}
	
	function checkUser(userid, password) {
		var ajax = new $M.Ajax();//创建 ajax 对象
		ajax.add("userid", userid); //设置 ajax 参数
		ajax.add("password", password);
		ajax.setAction("/CheckUser.jsp"); //设置 ajax 请求地址
		ajax.submit(function(result) { //ajax 请求成功的回调函数，result 为返回的数据
			log("回传的值:"+result);
			var result = result.replace(/\s/g,''); 
			log("经过处理后回传的值:"+result);
			var user = result;
			if (user == "true") {
				pref = new $M.Preferences();//创建一个本地持久化存储对象
				pref.open('myPref');//打开已经存在的本地化存储对象，假如该对象不存在，则创建一个本地持久化存储
				pref.put("userid", userid);
				pref.put("password", password);
				$M.page.goTo({
					'url' : '/choosepage.html',
					'params' : userid,
					'isDestroySelf' : true,
				});	
			} else {
				alert("用户名或密码错误,请重新输入!!!!!!");
			}
		}, function(errorCode, errorMsg) { //ajax 请求失败的回调函数
			log("ajax Error : " + errorCode + " " + errorMsg);//在控制台打印
		});
	};


     Emp.page.render();