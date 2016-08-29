Emp.page.setId('_body_2078998912');
	

	function queryData(userid) {
		var ajax = new $M.Ajax();
		ajax.add("userid", userid);
		log("00000", userid);

		ajax.setAction("/queryPro.jsp");
		ajax.submit(function(result) {
			return result;

		}, function(errorCode, errorMsg) {

		});
	}


     Emp.page.render();