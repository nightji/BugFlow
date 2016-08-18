Emp.page.setId('_body_638804524');
var welcome = new Emp.Panel({"id":"welcome","height":"100%","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var logoDiv = new Emp.Panel({"id":"logoDiv","height":"246","hAlign":"center","width":"245"});
    var img = new Emp.Image({"id":"img","height":"246","width":"245","src":"/login/logo.png"});
            logoDiv.add(img);
                welcome.add(logoDiv);
        Emp.page.add(welcome);
		

	var userid;
	var password;
	Emp.page.setBackgroundColor("#eaeaea");

	Emp.page.addEvent("onLoad", function() {
		login();
	});

	function login() {
		var pref = new $M.Preferences();//创建一个本地持久化存储对象
		pref.open('myPref');//打开已经存在的本地化存储对象，假如该对象不存在，则创建一个本地持久化存储
		userid = pref.get("userid");
		password = pref.get("password");

		//server push.jsp 推送接收消息处理配置记录
		logoDiv.clearAnimation();
		var alphaAnimation = new $M.AlphaAnimation({
			fromAlpha : 0,
			toAlpha : 1,
			duration : 1500
		});
		logoDiv.addAnimation(alphaAnimation);
		//logoDiv.setDisplay(true);
		setTimeout(function() {
			logoDiv.startAnimation();
		}, 20);

		//当所有的动画退出之后 就显示portal界面
		alphaAnimation.addEvent("onAnimationEnd", function() {
			//如果账号合理则跳转到主页，不合理则跳转到登录页
			//ＴＯ　ＤＯ'
			var data = "a";
			$M.page.goTo({
				'url' : '/choosepage.html',
				'params' : data,
				'isDestroySelf' : true,
			});

		});

	}


     Emp.page.render();