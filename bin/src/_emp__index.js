Emp.page.setId('_body_1462423084');
	

	$M.includeFile("/Utils/loginUtils.html");


     var welcome = new Emp.Panel({"id":"welcome","height":"100%","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var logoDiv = new Emp.Panel({"id":"logoDiv","height":"246","hAlign":"center","width":"245"});
    var img = new Emp.Image({"id":"img","height":"246","width":"245","src":"/login/logo.png"});
            logoDiv.add(img);
                welcome.add(logoDiv);
        Emp.page.add(welcome);
		

	$M.page.setBackgroundColor("#eaeaea");
	$M.page.addEvent("onLoad", function() {
		login();
	});

	function login() {
		/* 	var pref = new $M.Preferences();//创建一个本地持久化存储对象
			pref.open('myPref');//打开已经存在的本地化存储对象，假如该对象不存在，则创建一个本地持久化存储
		 */
		logoDiv.clearAnimation();
		var alphaAnimation = new $M.AlphaAnimation({
			fromAlpha : 0,
			toAlpha : 1,
			duration : 1500
		});
		logoDiv.addAnimation(alphaAnimation);
		setTimeout(function() {
			logoDiv.startAnimation();
		}, 20);
		//当所有的动画退出之后 就显示portal界面
		alphaAnimation.addEvent("onAnimationEnd", function() {
			var userid = pref.get("userid");
			var password = pref.get("password");
			checkUser(userid, password);
		});
	}

	/* function checkUser(userid, password) {
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
					'params' : userid,
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
	}; */


     Emp.page.render();