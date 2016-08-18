Emp.page.setId('_body_901804237');
var welcome = new Emp.Panel({"id":"welcome","height":"100%","layout":"VBox","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var _div_1445504915 = new Emp.Panel({"id":"_div_1445504915","height":"180","layout":"HBox","width":"100%"});
    var _div_118607894 = new Emp.Panel({"id":"_div_118607894","height":"100%","width":"100%"});
            _div_1445504915.add(_div_118607894);
        var _div_578050042 = new Emp.Panel({"id":"_div_578050042","paddingTop":"10","height":"60","width":"60","paddingBottom":"10","paddingLeft":"10","paddingRight":"10"});
    var _img_71036866 = new Emp.Image({"id":"_img_71036866","height":"100%","width":"100%","src":"/images/setting.png"});
	_img_71036866.addEvent('onClick',onClickSetting);
            _div_578050042.add(_img_71036866);
                _div_1445504915.add(_div_578050042);
                welcome.add(_div_1445504915);
        var _div_2063182777 = new Emp.Panel({"id":"_div_2063182777","wAlign":"center","height":"60","width":"120"});
    var _img_494484930 = new Emp.Image({"id":"_img_494484930","height":"100%","width":"100%","src":"/images/button1.png"});
	_img_494484930.addEvent('onClick',onClikNewFlow);
            _div_2063182777.add(_img_494484930);
                welcome.add(_div_2063182777);
        var _div_46504620 = new Emp.Panel({"id":"_div_46504620","height":"100","width":"100%"});
            welcome.add(_div_46504620);
        var _div_2066584479 = new Emp.Panel({"id":"_div_2066584479","wAlign":"center","height":"60","width":"120"});
    var _img_1832315622 = new Emp.Image({"id":"_img_1832315622","height":"100%","width":"100%","src":"/images/button2.png"});
	_img_1832315622.addEvent('onClick',onClickExistFlow);
            _div_2066584479.add(_img_1832315622);
                welcome.add(_div_2066584479);
        Emp.page.add(welcome);
		

	function onClickSetting() {
	//todo
	$M.page.goTo({
				'url' : '/login.html',
			});
	}
	function onClikNewFlow(){
	//todo
		$M.page.goTo({
				'url' : '/newFlow.html',
			});
	}
	function onClickExistFlow(){
	//todo
		$M.page.goTo({
				'url' : '/existFlow.html',
			});
	}


     Emp.page.render();