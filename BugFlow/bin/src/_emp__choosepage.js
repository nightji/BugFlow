Emp.page.setId('_body_135796918');
var welcome = new Emp.Panel({"id":"welcome","height":"100%","layout":"VBox","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var _div_494734960 = new Emp.Panel({"id":"_div_494734960","height":"180","layout":"HBox","width":"100%"});
    var _div_2101275183 = new Emp.Panel({"id":"_div_2101275183","height":"100%","width":"100%"});
            _div_494734960.add(_div_2101275183);
        var _div_763425766 = new Emp.Panel({"id":"_div_763425766","paddingTop":"10","height":"60","width":"60","paddingBottom":"10","paddingLeft":"10","paddingRight":"10"});
    var _img_1829541984 = new Emp.Image({"id":"_img_1829541984","height":"100%","width":"100%","src":"/images/setting.png"});
	_img_1829541984.addEvent('onClick',onClickSetting);
            _div_763425766.add(_img_1829541984);
                _div_494734960.add(_div_763425766);
                welcome.add(_div_494734960);
        var _div_1441267342 = new Emp.Panel({"id":"_div_1441267342","wAlign":"center","height":"60","width":"120"});
    var _img_1912162481 = new Emp.Image({"id":"_img_1912162481","height":"100%","width":"100%","src":"/images/button1.png"});
	_img_1912162481.addEvent('onClick',onClikNewFlow);
            _div_1441267342.add(_img_1912162481);
                welcome.add(_div_1441267342);
        var _div_622040812 = new Emp.Panel({"id":"_div_622040812","height":"100","width":"100%"});
            welcome.add(_div_622040812);
        var _div_689533688 = new Emp.Panel({"id":"_div_689533688","wAlign":"center","height":"60","width":"120"});
    var _img_1170935004 = new Emp.Image({"id":"_img_1170935004","height":"100%","width":"100%","src":"/images/button2.png"});
	_img_1170935004.addEvent('onClick',onClickExistFlow);
            _div_689533688.add(_img_1170935004);
                welcome.add(_div_689533688);
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