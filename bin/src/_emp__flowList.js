Emp.page.setId('_body_957310393');
var nav = new Emp.Panel({"id":"nav","height":"52","width":"100%"});
    var _div_1420958180 = new Emp.Panel({"id":"_div_1420958180","height":"100%","backgroundColor":"#474747","vAlign":"middle","hAlign":"center","width":"100%"});
    var _input_2025976620 = new Emp.Label({"id":"_input_2025976620","color":"#ffffff","value":"流程列表","fontSize":"25"});
            _div_1420958180.add(_input_2025976620);
                nav.add(_div_1420958180);
        Emp.page.add(nav);
	var _div_88345508 = new Emp.Panel({"id":"_div_88345508","height":"100%","backgroundColor":"#eaeaea","layout":"VBox","width":"100%"});
    var listview = new Emp.ListView({"dividerVisible":"true","id":"listview","height":"100%","backgroundColor":"#eaeaea","width":"100%","dividerColor":"#eaeaea"});

    var _template_1534816008 = new Emp.Panel({"id":"_template_1534816008"});
_template_1534816008.__isTemplate=true;
    var _div_79078692 = new Emp.Panel({"id":"_div_79078692","height":"-2","vAlign":"middle","layout":"VBox","width":"100%"});
    var _div_1930682598 = new Emp.Panel({"id":"_div_1930682598","height":"-2","marginLeft":"10","layout":"VBox","marginRight":"10","width":"100%"});
    var _div_504518416 = new Emp.Panel({"id":"_div_504518416","height":"100%","layout":"HBox","width":"100%"});
    var _input_1175579356 = new Emp.Label({"id":"_input_1175579356","color":"#919da4","value":"bug号：","fontSize":"14"});
            _div_504518416.add(_input_1175579356);
        var _input_1112683892 = new Emp.Label({"id":"_input_1112683892","color":"#919da4","tag":"proId","fontSize":"14"});
            _div_504518416.add(_input_1112683892);
                _div_1930682598.add(_div_504518416);
        var _input_590574768 = new Emp.Label({"id":"_input_590574768","marginTop":"3","tag":"proTitle","fontBold":"true","fontSize":"16"});
            _div_1930682598.add(_input_590574768);
                _div_79078692.add(_div_1930682598);
        var _div_120709342 = new Emp.Panel({"id":"_div_120709342","height":"100%","marginLeft":"10","marginTop":"3","marginRight":"10","layout":"HBox","width":"100%"});
    var _div_1537348226 = new Emp.Panel({"id":"_div_1537348226","height":"-2","layout":"HBox","hAlign":"left","width":"100%"});
    var _input_1835877325 = new Emp.Label({"id":"_input_1835877325","color":"#919da4","value":"最后参与：","fontSize":"14"});
            _div_1537348226.add(_input_1835877325);
        var _input_545161179 = new Emp.Label({"id":"_input_545161179","color":"#919da4","tag":"personDealNow","fontSize":"14"});
            _div_1537348226.add(_input_545161179);
                _div_120709342.add(_div_1537348226);
        var _div_1358697351 = new Emp.Panel({"id":"_div_1358697351","height":"-2","hAlign":"right","width":"100%"});
    var _input_1432759706 = new Emp.Label({"id":"_input_1432759706","color":"#919da4","tag":"status","fontSize":"14"});
            _div_1358697351.add(_input_1432759706);
                _div_120709342.add(_div_1358697351);
                _div_79078692.add(_div_120709342);
        var _div_658244931 = new Emp.Panel({"id":"_div_658244931","height":"2","backgroundColor":"#f4f4f4","width":"100%"});
            _div_79078692.add(_div_658244931);
                _template_1534816008.add(_div_79078692);
                listview.setTemplate(_template_1534816008,"_template_1534816008");
    
            _div_88345508.add(listview);
        Emp.page.add(_div_88345508);
		

	$M.page.addEvent("onLoad", function(data) {
		var items = data.jsonString;
		alert(items);

		listview.setItems(items);
		listview.reloadData();

	});
	listview.addEvent('onItemClick', function(row, tag, data) {
		$M.page.goTo({
			'url' : '/existFlow5.html',
		});
	});


     Emp.page.render();