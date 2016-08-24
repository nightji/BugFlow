Emp.page.setId('_body_1076674172');
var welcome = new Emp.Panel({"id":"welcome","height":"100%","layout":"VBox","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var _div_291531495 = new Emp.Panel({"id":"_div_291531495","height":"180","layout":"HBox","width":"100%"});
    var _div_1359637658 = new Emp.Panel({"id":"_div_1359637658","height":"100%","width":"100%"});
            _div_291531495.add(_div_1359637658);
        var _div_56630279 = new Emp.Panel({"id":"_div_56630279","paddingTop":"10","height":"60","width":"60","paddingBottom":"10","paddingLeft":"10","paddingRight":"10"});
    var _img_449843532 = new Emp.Image({"id":"_img_449843532","height":"100%","width":"100%","src":"/images/setting.png"});
	_img_449843532.addEvent('onClick',onClickSetting);
            _div_56630279.add(_img_449843532);
                _div_291531495.add(_div_56630279);
                welcome.add(_div_291531495);
        var _div_1377804884 = new Emp.Panel({"id":"_div_1377804884","wAlign":"center","height":"60","width":"120"});
    var _img_450519787 = new Emp.Image({"id":"_img_450519787","height":"100%","width":"100%","src":"/images/button1.png"});
	_img_450519787.addEvent('onClick',onClikNewFlow);
            _div_1377804884.add(_img_450519787);
                welcome.add(_div_1377804884);
        var _div_2006204434 = new Emp.Panel({"id":"_div_2006204434","height":"100","width":"100%"});
            welcome.add(_div_2006204434);
        var _div_637180691 = new Emp.Panel({"id":"_div_637180691","wAlign":"center","height":"60","width":"120"});
    var _img_1742409695 = new Emp.Image({"id":"_img_1742409695","height":"100%","width":"100%","src":"/images/button2.png"});
	_img_1742409695.addEvent('onClick',onClickExistFlow);
            _div_637180691.add(_img_1742409695);
                welcome.add(_div_637180691);
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
				'url' : '/existFlow1.html',
			});
	}


     Emp.page.render();