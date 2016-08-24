Emp.page.setId('_body_1769910832');
var _div_2095358827 = new Emp.Panel({"id":"_div_2095358827","height":"100%","width":"100%","backgroundImage":"/images/bg.jpg"});
    var _div_111478236 = new Emp.Panel({"id":"_div_111478236","height":"100%","vAlign":"middle","layout":"VBox","hAlign":"center","width":"100%"});
    var _div_1008972268 = new Emp.Panel({"id":"_div_1008972268","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"10"});
    var _input_1266031564 = new Emp.Label({"id":"_input_1266031564","color":"#eaeaea","value":"账号："});
            _div_1008972268.add(_input_1266031564);
        var EMPuserid = new Emp.Text({"id":"EMPuserid","width":"180","emptyText":"请输入账号"});
            _div_1008972268.add(EMPuserid);
                _div_111478236.add(_div_1008972268);
        var _div_1391555259 = new Emp.Panel({"id":"_div_1391555259","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_1772322183 = new Emp.Label({"id":"_input_1772322183","color":"#eaeaea","value":"密码："});
            _div_1391555259.add(_input_1772322183);
        var EMPpassword = new Emp.Text({"id":"EMPpassword","width":"180","emptyText":"请输入密码"});
EMPpassword.setInputType("password");
            _div_1391555259.add(EMPpassword);
                _div_111478236.add(_div_1391555259);
        var _div_1780023234 = new Emp.Panel({"id":"_div_1780023234","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_255807481 = new Emp.Button({"id":"_input_255807481","width":"120","value":"登录"});
	_input_255807481.addEvent('onClick',login);
            _div_1780023234.add(_input_255807481);
        var _input_94071873 = new Emp.Button({"id":"_input_94071873","width":"120","value":"取消"});
	_input_94071873.addEvent('onClick',cancel);
            _div_1780023234.add(_input_94071873);
                _div_111478236.add(_div_1780023234);
                _div_2095358827.add(_div_111478236);
        Emp.page.add(_div_2095358827);
		

	function login() {

		var pref = new $M.Preferences();//创建一个本地持久化存储对象
		pref.open('myPref');//打开已经存在的本地化存储对象，假如该对象不存在，则创建一个本地持久化存储
		var userid = EMPuserid.getValue();
		var password = EMPpassword.getValue();
		log("login,EMPuserid", userid);
		log("login,EMPpassword", password);
		var user = chackUser(userid, password);

		if (user.user == "wrong") {
			alert("wrong");

		} else {
			pref.put("userid", userid);
			pref.put("password", password);
			/* $M.page.goTo({
				'url' : '/choosepage.html',
				'params' : userid,
				'isDestroySelf' : true,
			}); */
		}

	}
	function cancel() {
		EMPuserid.setValue("");
		EMPpassword.setValue("");

	}
	function chackUser(userid, password) {
		var ajax = new $M.Ajax();//创建 ajax 对象
		ajax.add("userid", userid); //设置 ajax 参数
		ajax.add("password", password);
		ajax.setAction("/ChackUser.jsp"); //设置 ajax 请求地址
		ajax.submit(function(result) { //ajax 请求成功的回调函数，result 为返回的数据
			return result;
		}, function(errorCode, errorMsg) { //ajax 请求失败的回调函数
			log("ajax Error : " + errorCode + " " + errorMsg);//在控制台打印
		});

	};


     Emp.page.render();