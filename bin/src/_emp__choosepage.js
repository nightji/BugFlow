Emp.page.setId('_body_2099489736');
	

	/* 	$M.includeFile("/Utils/queryUtils.html"); */


     var welcome = new Emp.Panel({"id":"welcome","height":"100%","layout":"VBox","hAlign":"center","width":"100%","backgroundImage":"/images/bg.jpg","class":"setting-title"});
    var _div_220589572 = new Emp.Panel({"id":"_div_220589572","height":"180","layout":"HBox","width":"100%"});
    var _div_892161882 = new Emp.Panel({"id":"_div_892161882","height":"100%","width":"100%"});
            _div_220589572.add(_div_892161882);
        var _div_833927420 = new Emp.Panel({"id":"_div_833927420","paddingTop":"10","height":"60","width":"60","paddingBottom":"10","paddingLeft":"10","paddingRight":"10"});
    var _img_1339867618 = new Emp.Image({"id":"_img_1339867618","height":"100%","width":"100%","src":"/images/setting.png"});
	_img_1339867618.addEvent('onClick',onClickSetting);
            _div_833927420.add(_img_1339867618);
                _div_220589572.add(_div_833927420);
                welcome.add(_div_220589572);
        var _div_641533284 = new Emp.Panel({"id":"_div_641533284","wAlign":"center","height":"60","width":"120"});
    var _img_1881996248 = new Emp.Image({"id":"_img_1881996248","height":"100%","width":"100%","src":"/images/button1.png"});
	_img_1881996248.addEvent('onClick',onClikNewFlow);
            _div_641533284.add(_img_1881996248);
                welcome.add(_div_641533284);
        var _div_424303473 = new Emp.Panel({"id":"_div_424303473","height":"100","width":"100%"});
            welcome.add(_div_424303473);
        var _div_1622762671 = new Emp.Panel({"id":"_div_1622762671","wAlign":"center","height":"60","width":"120"});
    var _img_729894597 = new Emp.Image({"id":"_img_729894597","height":"100%","width":"100%","src":"/images/button2.png"});
	_img_729894597.addEvent('onClick',onClickExistFlow);
            _div_1622762671.add(_img_729894597);
                welcome.add(_div_1622762671);
        Emp.page.add(welcome);
		

	var userid;
	$M.page.addEvent("onLoad", function(data) {
		userid = data.userid;
	});

	function onClickSetting() {
		var ajax = new $M.Ajax();
		ajax.add("userid", userid);
		log("00000", userid);

		ajax.setAction("/queryPro.jsp");
		ajax.submit(function(result) {
		
			$M.page.goTo({
				'url' : '/flowList.html',
				'params' : {
					jsonString:result
				},
			});
		}, function(errorCode, errorMsg) {

		});

	}

	function onClikNewFlow() {
		//todo
		$M.page.goTo({
			'url' : '/newFlow.html',
		});
	}

	function onClickExistFlow() {
		//todo
		$M.page.goTo({
			'url' : '/flowList.html',
		});
	}


     Emp.page.render();