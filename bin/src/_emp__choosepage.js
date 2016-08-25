Emp.page.setId('_body_117561297');
var welcome = new Emp.Panel({"id":"welcome","height":"100%","layout":"VBox","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var _div_2101574409 = new Emp.Panel({"id":"_div_2101574409","height":"180","layout":"HBox","width":"100%"});
    var _div_1497549854 = new Emp.Panel({"id":"_div_1497549854","height":"100%","width":"100%"});
            _div_2101574409.add(_div_1497549854);
        var _div_812053338 = new Emp.Panel({"id":"_div_812053338","paddingTop":"10","height":"60","width":"60","paddingBottom":"10","paddingLeft":"10","paddingRight":"10"});
    var _img_921875081 = new Emp.Image({"id":"_img_921875081","height":"100%","width":"100%","src":"/images/setting.png"});
	_img_921875081.addEvent('onClick',onClickSetting);
            _div_812053338.add(_img_921875081);
                _div_2101574409.add(_div_812053338);
                welcome.add(_div_2101574409);
        var _div_2007456909 = new Emp.Panel({"id":"_div_2007456909","wAlign":"center","height":"60","width":"120"});
    var _img_212691546 = new Emp.Image({"id":"_img_212691546","height":"100%","width":"100%","src":"/images/button1.png"});
	_img_212691546.addEvent('onClick',onClikNewFlow);
            _div_2007456909.add(_img_212691546);
                welcome.add(_div_2007456909);
        var _div_1294025014 = new Emp.Panel({"id":"_div_1294025014","height":"100","width":"100%"});
            welcome.add(_div_1294025014);
        var _div_1111517129 = new Emp.Panel({"id":"_div_1111517129","wAlign":"center","height":"60","width":"120"});
    var _img_308141850 = new Emp.Image({"id":"_img_308141850","height":"100%","width":"100%","src":"/images/button2.png"});
	_img_308141850.addEvent('onClick',onClickExistFlow);
            _div_1111517129.add(_img_308141850);
                welcome.add(_div_1111517129);
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
				'url' : '/existFlow5.html',
			});
	}


     Emp.page.render();