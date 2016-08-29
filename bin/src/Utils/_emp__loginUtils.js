Emp.page.setId('_body_1797390912');
	

	var pref = new $M.Preferences();//创建一个本地持久化存储对象
	pref.open('myPref');//打开已经存在的本地化存储对象，假如该对象不存在，则创建一个本地持久化存储

	function checkUser(userid, password) {
		var ajax = new $M.Ajax();//创建 ajax 对象
		ajax.add("userid", userid); //设置 ajax 参数
		ajax.add("password", password);
		ajax.setAction("/CheckUser.jsp"); //设置 ajax 请求地址
		ajax.submit(function(result) { //ajax 请求成功的回调函数，result 为返回的数据
			var user = result.replace(/\s/g, '');
			user = user.replace(/[\r\n]/g, "");
			log("返回值是否带空格", user);
			if (user == "true") {
				$M.page.goTo({
					'url' : '/choosePage.html',
					'params' : {
						userid : userid
					},
					'isDestroySelf' : true,
				});
			} else {
				$M.page.goTo({
					'url' : '/login.html',
					'isDestroySelf' : true,
				});
			}
		}, function(errorCode, errorMsg) { //ajax 请求失败的回调函数
			log("ajax Error : " + errorCode + " " + errorMsg);//在控制台打印
		});
	};


     Emp.page.render();