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
			var user = result.replace(/\s/g,''); 
			user = user.replace(/[\r\n]/g,"");
			log("经过处理后回传的值:"+user);
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