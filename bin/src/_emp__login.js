Emp.page.setId('_body_1718545178');
var _div_2081238143 = new Emp.Panel({"id":"_div_2081238143","height":"100%","width":"100%","backgroundImage":"/images/bg.jpg"});
    var _div_1155827065 = new Emp.Panel({"id":"_div_1155827065","height":"100%","vAlign":"middle","layout":"VBox","hAlign":"center","width":"100%"});
    var _div_1995894340 = new Emp.Panel({"id":"_div_1995894340","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"10"});
    var _input_1301606240 = new Emp.Label({"id":"_input_1301606240","color":"#eaeaea","value":"账号："});
            _div_1995894340.add(_input_1301606240);
        var EMPuserid = new Emp.Text({"id":"EMPuserid","width":"180","emptyText":"请输入账号"});
            _div_1995894340.add(EMPuserid);
                _div_1155827065.add(_div_1995894340);
        var _div_1810206725 = new Emp.Panel({"id":"_div_1810206725","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_743600026 = new Emp.Label({"id":"_input_743600026","color":"#eaeaea","value":"密码："});
            _div_1810206725.add(_input_743600026);
        var EMPpassword = new Emp.Text({"id":"EMPpassword","width":"180","emptyText":"请输入密码"});
EMPpassword.setInputType("password");
            _div_1810206725.add(EMPpassword);
                _div_1155827065.add(_div_1810206725);
        var _div_1467248680 = new Emp.Panel({"id":"_div_1467248680","height":"-2","vAlign":"middle","hAlign":"center","width":"100%","paddingBottom":"20"});
    var _input_493846259 = new Emp.Button({"id":"_input_493846259","width":"120","value":"登录"});
	_input_493846259.addEvent('onClick',login);
            _div_1467248680.add(_input_493846259);
        var _input_49779358 = new Emp.Button({"id":"_input_49779358","width":"120","value":"取消"});
	_input_49779358.addEvent('onClick',cancel);
            _div_1467248680.add(_input_49779358);
                _div_1155827065.add(_div_1467248680);
                _div_2081238143.add(_div_1155827065);
        Emp.page.add(_div_2081238143);
		

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