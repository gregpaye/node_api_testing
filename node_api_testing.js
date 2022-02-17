///////////////////////////////////////////////////
//
// SAMPLE NODE API TESTING SCRIPT AND SERVICE
// G.PAYE
//
///////////////////////////////////////////////////
//-------------------------------------------------
//
// start global modules
//
//-------------------------------------------------
const fetch = require('node-fetch');
const express = require('express'),
    app = express();
const http = require('http');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
//-------------------------------------------------
//
// end global modules
//
//-------------------------------------------------
//
// start global variables
//
//-------------------------------------------------
const gsNO_REQUEST = "/";
const webhostname = '127.0.0.1';
const web_port = 8080;
const app_port = 7777;
const gsAPI_SERVER = "https://api-server.com";
const gsUSER_NAME = 'accountname01';
const gsUSER_PASSWORD = 'password123';
const gsPORTABLE_DEVICE_ID = "873e101e200cb94348f1c7efg7be633g";
const PRIMARY_SERVER_ID = 1234; 
const gaLOGIN_ARRAY = 	[
	gsUSER_NAME, 
	gsUSER_PASSWORD, 
	gsPORTABLE_DEVICE_ID, 
	'',	//3: sessionId
	''	//4: misc
];
const appAPI_SERVICE_LOGIN = "/api_service_login";
const appAPI_SERVICE_OTP = "/api_service_otp";
const appAPI_SERVICE_CONFIG = "/api_service_config";
var gsSUMMARY_REPORT = "";
//-------------------------------------------------
//
// end global variables
//
//-------------------------------------------------
//
// start utility functions
//
//-------------------------------------------------
// isNumeric:	
//	 evaluate if a character is numeric or not
//	 parameters[1]: one character from a string
// 	 return: bool true/false if a character is numeric
//-------------------------------------------------
function isNumeric(paramChar) { 
	return /\d/.test(paramChar); 
};
//-------------------------------------------------
// parseLogString:	
//	 remove line returns from a string for logging
//	 parameters[1]: a string
//	 return: the parameter string without any line returns
//-------------------------------------------------
function parseLogString(paramString){
	return paramString.replace(/(\r\n|\n|\r)/gm, "")
};
//-------------------------------------------------
// doDate:	
//	 return a date-time for logging
//	 parameters[0]: none
//	 return: a date-time string in YYYYMMDD|HH:MM format
//-------------------------------------------------
function doDate() {
	var d = new Date(),
	minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
	hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
	months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
	return (d.getFullYear()+months[d.getMonth()]+d.getDate()+'|'+hours+':'+minutes);
};
//-------------------------------------------------
// doLog:	
//	 make log entries in a uniform format
//	 parameters[1]: string
//	 return: none
//-------------------------------------------------
function doLog(paramLogEntry) {
	console.log(doDate()+"["+paramLogEntry+"]");
};
//-------------------------------------------------
//
// end utility functions
//
//-------------------------------------------------
//
//  start web server startup
//
//-------------------------------------------------
http.createServer(function(req, res) {
	var requestString = req.url;
	//doLog('req.url: ' + requestString );
	if (requestString.indexOf('?') > -1) {
		requestString = requestString.substring(0,requestString.indexOf('?'));
	};
	if (requestString.charAt(requestString.length-1)=='/') {
		requestString = requestString +'index.html';
	};
	if (requestString.indexOf('.')== -1) {
		requestString = requestString + '/index.html';
	};
	doLog('WEB SERVER request: ' + requestString );
	var parsedUrl = "";
	for (let i = 0; i < requestString.length; i++) {
		if (requestString.charAt(i)=='/') {
			parsedUrl += '\\';
		} else {
			parsedUrl += requestString.charAt(i);
		};
	};
	var pathname = __dirname + parsedUrl;
	fs.readFile(pathname, function(err, data) {
            		res.end(data);
	});
	doLog(`WEB SERVER return: `+pathname);
}).listen(web_port, webhostname);
doLog(`web server running at http://${webhostname}:${web_port}/`);
//-------------------------------------------------
//
//  end web server startup
//
//-------------------------------------------------
//
// start app server startup
//
//-------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true })); 
app.listen(app_port, () => {
	doLog(`express app server running API_SERVICE Services test at http://${webhostname}:${app_port}/`);
});
//-------------------------------------------------
//
// end app server startup
//
//-------------------------------------------------
//
// start app responses
//
//-------------------------------------------------
//	when app port is called directly 
//	with GET run API_SERVICE Services test
//-------------------------------------------------
app.get(gsNO_REQUEST, async (req, res, err) => {
	await testRun()
		.then(async function(returnValue) {
			//pre tags broken up to allow source code viewing on browser
			return res.send("<"+"pre"+">"+returnValue+"<"+"/pre"+">");
		}).catch(function (err) {
			// There was an error
			console.warn('ERROR: ', err);
	 });
});
//-------------------------------------------------
//	when app port is called with 
//	GET viewsource show source code file
//-------------------------------------------------
app.get("/viewsource", async (req, res, err) => {
	var filePath = path.join(__dirname, 'services.js');
	let thisReturn = fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
		if (!err) {
			//pre tags broken up to allow source code viewing on browser
			res.send("<"+"pre"+">"+data+"<"+"/pre"+">");
			res.end();
		} else {
			console.log(err);
		};
	});
});
//-------------------------------------------------
//	when post form sends API_SERVICE login request 
//	login to API_SERVICE and return json
//-------------------------------------------------
app.post(appAPI_SERVICE_LOGIN, async function(req, res) {
	doLog('api_service_login username='+req.body.username);
	doLog('api_service_login password='+req.body.password);
	doLog('api_service_login deviceid='+req.body.deviceid);
  	var returnlogin = "";
      returnlogin = await fetch(gsAPI_SERVER + "/Login/Eso", {
  		body: 	JSON.stringify({ 
				"Username":req.body.username,
				"Password":req.body.password,
				"DeviceId":req.body.deviceid
			}) ,
  			headers: {
				"Accept":"application/json",
				"Content-Type":"application/json"
			},
  		method: "post"
	}).then(async function(response) {
		return response.text();
	}).catch(function (err) {
		console.warn('ERROR: ', err);
	});
	res.redirect('http://' + webhostname + ':' + web_port + '/index.html?test=' + appAPI_SERVICE_LOGIN + 
				'&un=' + req.body.testusername + '&pd=' + req.body.testpassword + 
				'&did=' + req.body.testdeviceid + '&return=' + returnlogin);
	doLog('api_service_Login = '+ returnlogin);
});
//-------------------------------------------------
//	when post form sends API_SERVICE otp
//	submit otp to API_SERVICE service and return json
//-------------------------------------------------
app.post(appAPI_SERVICE_OTP, async function(req, res) {
	doLog('api_service_otp authid ='+req.body.authid);
	doLog('api_service_otp deviceid='+req.body.deviceid);
	doLog('api_service_otp otp='+req.body.otp);
	var otp_return = "";
	otp_return = await fetch(gsAPI_SERVER + "/Login/Otp", {
  		body: 	JSON.stringify({ 
				"AuthId":req.body.testauthid,
				"DeviceId":req.body.testdeviceid,
				"Otp":req.body.testotp
			}) ,
  			headers: {
				"Accept":"application/json",
				"Content-Type":"application/json"
			},
  		method: "post"
	}).then(async function(response) {
		return response.text();
	}).catch(function (err) {
		// There was an error
		console.warn('ERROR: ', err);
	});
	res.redirect('http://' + webhostname + ':' + web_port + '/otp.html?test=' + appAPI_SERVICE_OTP + 
				'&aid=' + req.body.testauthid + '&did=' + req.body.testdeviceid + 
				'&otp=' + req.body.testotp + '&return=' + otp_return);
	doLog('api_service_otp = '+ otp_return);
});
//-------------------------------------------------
//	when post form sends config request 
//	request config from API and return it
//-------------------------------------------------
app.post(appAPI_SERVICE_CONFIG, async function(req, res) {
	var api_service_return = "";
	api_service_return = await fetch(gsAPI_SERVER + "/ClientConfig/GetConfig", {
  		headers: {
		},
  		method: "get"
	}).then(async function(response) {
		return response.text();
	}).catch(function (err) {
		// There was an error
		console.warn('ERROR: ', err);
	});
	res.redirect('http://' + webhostname + ':' + web_port + '/config.html?test=' + 
				appAPI_SERVICE_CONFIG + '&return='+api_service_return);
	doLog('api_service_config = '+ api_service_return);
});
//-------------------------------------------------
//
// end app responses
//
//-------------------------------------------------
//
// start API_SERVICE API functions
//
//-------------------------------------------------
///////////////////////////////////////////////////////////
// LOGIN API_SERVICE: USES THE GLOBAL LOGIN ARRAY TO LOGIN TO \
// API_SERVICE/ESO. IF SUCCESSFUL, THE GLOBAL LOGIN ARRAY WILL
// HAVE A SESSION ID AND MISC STRING WHICH ARE ADDED TO
// THE GLOBAL LOGIN ARRAY. IF THE OTP IS REQUIRED, IT WILL
// RETURN OTP_REQUIRED AS THE SESSION ID. IF THERE IS AN 
// UNANTICIPATED ERROR CONDITION, THE ARRAY'S 3RD SPOT
// BE 'ERROR' AND THE 4TH WILL HAVE THE RETURNED STATUS
///////////////////////////////////////////////////////////
async function loginAPI(){
	var returnLogin = '';
	var loginResult = await fetch(gsAPI_SERVER + "/login/api_service", {
		body: 	JSON.stringify({ 
			"username":gaLOGIN_ARRAY[0],
			"password":gaLOGIN_ARRAY[1],
			"DeviceId":gaLOGIN_ARRAY[2]
		}) ,
			headers: {
			"Accept":"application/json",
			"Content-Type":"application/json"
		},
		method: "post"
	}).then(async function(res) {
		return res.text();
	}).catch(function (err) {
		// There was an error
		console.warn('ERROR: ', err);
	});
	//doLog(`loginResult: `+loginResult);
	gsSUMMARY_REPORT += "TEST: " + gsAPI_SERVER + "/login/api_service\n";
	var loginResult = parseLogString(loginResult);
	if (loginResult.indexOf("OTP_REQUIRED") > -1) {
		gsAUTH_ID = loginResult.substring((loginResult.indexOf("AuthId")+9),(loginResult.length-3));
		doLog(`WARNING LOGIN: OTP_REQUIRED`);
		gaLOGIN_ARRAY[3] = 'OTP_REQUIRED';
	} else {
         //if not otp, populate global login array and return login status
		var status = loginResult.substring((loginResult.indexOf("Status")+9),(loginResult.indexOf("SessionId")-3));
		if ((status == "SUCCESS")&&(loginResult.indexOf("SessionId") > -1)) {
			gaLOGIN_ARRAY[3] = loginResult.substring((loginResult.indexOf("SessionId")+12),(loginResult.indexOf("RefreshToken")-3));
		} else {
			gaLOGIN_ARRAY[3] = "ERROR";
			doLog('ERROR: Login Status: '+status);
		};
        gaLOGIN_ARRAY[4] = status;
		returnLogin = status;
	};
	return returnLogin;
};
/////////////////////////////
// GET ALL STORE CATEGORIES
/////////////////////////////
async function getStoreCategories(){
	var getStoreCategoriesArrayReturn = [];
	var getStoreCategoriesResult = await fetch(gsAPI_SERVER + 
		"/GeneralStore/GetCategories?ServerId=" + PRIMARY_SERVER_ID, {
		headers: {
			"Accept":"application/json",
			"Content-Type":"application/json",
			"X-Zos-Session-Id":gaLOGIN_ARRAY[3]
		},
		method: "get"
	}).then(async function(res) {
		return res.text();
	}).catch(function (err) {
		// There was an error
		console.warn('ERROR: ', err);
	});
	var thisThing = getStoreCategoriesResult;
	for (let i = 0; i < thisThing.length; i++) {
		if (thisThing.indexOf("Id") > -1) {
			var thisArray = [];
			var iFirstId = thisThing.indexOf("Id")+4;
			var iDisplayName = thisThing.indexOf("DisplayName")-2;
			var iD = thisThing.substring(iFirstId,iDisplayName);
			thisArray[0] = iD;
			var disName = thisThing.substring(thisThing.indexOf("\":\"")+3,thisThing.indexOf("\"},"));
			thisArray[1] = disName;
			thisThing = thisThing.substring(thisThing.indexOf("\"},"),thisThing.length);
			getStoreCategoriesArrayReturn.push(thisArray);
			thisThing = thisThing.substring(thisThing.indexOf("DisplayName")+11,thisThing.length);
		};
	};
	gsSUMMARY_REPORT += "TEST: " + gsAPI_SERVER + "/GeneralStore/GetCategories?ServerId=" + PRIMARY_SERVER_ID + "\n";
	getStoreCategoriesResult = parseLogString(getStoreCategoriesResult);
	//doLog(`getStoreCategoriesResult: `+getStoreCategoriesResult);
	return getStoreCategoriesArrayReturn;
};
///////////////////////////////////////
// GET ALL STORE CATEGORY SUBCATEGORIES
///////////////////////////////////////
async function getStoreSubCategories(paramCatId){
	var getStoreSubCategoriesArray = [];
	var getStoreSubCategoriesResult;
	if (paramCatId == null) {
		doLog(`ERROR: getStoreSubCategories paramCatId is null`)
		return;
	};
	if (paramCatId.toString() == "") {
		doLog(`ERROR: getStoreSubCategories paramCatId is blank`)
		return;
	};
	var getStoreSubCategoriesResult = await fetch(gsAPI_SERVER + 
	"/GeneralStore/GetSubCategories?RealmId=" + PRIMARY_SERVER_ID + "&CategoryId=" + paramCatId, {
		headers: {
			"Accept":"application/json",
			"Content-Type":"application/json",
			"X-Zos-Session-Id":gaLOGIN_ARRAY[3]
		},
		method: "get"
	}).then(async function(res) {
		return res.text();
	}).catch(function (err) {
		// There was an error
		console.warn('ERROR: ', err);
	});
	gsSUMMARY_REPORT += "TEST: " + gsAPI_SERVER + "/GeneralStore/GetSubCategories?RealmId=" + 
						PRIMARY_SERVER_ID+"&CategoryId=" + paramCatId + "\n";
	getStoreSubCategoriesResult = parseLogString(getStoreSubCategoriesResult);
	//doLog(`getStoreSubCategoriesResult for Category[`+paramCatId+`]: `+getStoreSubCategoriesResult);
	var thisThing = getStoreSubCategoriesResult;
	for (let i = 0; i < thisThing.length; i++) {
		if (thisThing.indexOf("Id") > -1) {
			var thisArray = [];
			var iFirstId = thisThing.indexOf("Id")+4;
			var iDisplayName = thisThing.indexOf("DisplayName")-2;
			var iD = thisThing.substring(iFirstId,iDisplayName);
			thisArray[0] = iD;
			var disName = thisThing.substring(thisThing.indexOf("\":\"")+3,thisThing.indexOf("\"},"));
			thisArray[1] = disName;
			thisThing = thisThing.substring(thisThing.indexOf("\"},"),thisThing.length);
			getStoreSubCategoriesArray.push(thisArray);
			thisThing = thisThing.substring(thisThing.indexOf("DisplayName")+11,thisThing.length);
		};
	};
	return getStoreSubCategoriesArray;
};
/////////////////////////////////////////////////////////////////
// GET PRODUCTS FOR EACH CATEGORY
////////////////////////////////////////////////////////////////
async function getStoreProducts(paramArrayCategories){
	var getStoreProductsReturn = [];
	var thisCatId = 0;
	if (Array.isArray(paramArrayCategories)) {
		if (paramArrayCategories.length > 0) {
			thisCatId = paramArrayCategories[1][0];
		};
	};
	var getStoreProductsResult = await fetch(gsAPI_SERVER + 
		"/GeneralStore/GetCategoryEntries?RealmId=" + PRIMARY_SERVER_ID + "&CategoryId=" + thisCatId, {
		headers: {
			"Accept":"application/json",
			"Content-Type":"application/json",
			"X-Zos-Session-Id":gaLOGIN_ARRAY[3]
		},
		method: "get"
	}).then(async function(res) {
		return res.text();
	}).catch(function (err) {
		// There was an error
		console.warn('ERROR: ', err);
	});
	getStoreProductsResult = parseLogString(getStoreProductsResult);
	gsSUMMARY_REPORT += "TEST: " + gsAPI_SERVER + "/GeneralStore/GetCategoryEntries?RealmId="
	gsSUMMARY_REPORT += PRIMARY_SERVER_ID + "&CategoryId=" + thisCatId + "\n";
	doLog(`getStoreProductsResult: ` + getStoreProductsResult);
	if (getStoreProductsResult.indexOf("{\"StoreCategoryEntries\":[]}") < 0) {
		var prodId = "";
		var boolStartNum = false;
		console.log(`getStoreProductsResult.length = ` + getStoreProductsResult.length);
		for (let i = 0; i < getStoreProductsResult.length; i++) {
			if (isNumeric(getStoreProductsResult.charAt(i))) {
				boolStartNum = true;
				prodId += getStoreProductsResult.charAt(i);
			} else {
				if ((boolStartNum == true)&&(prodId.length>0)) {
					//console.log(`adding to product return array: `+prodId);
					getStoreProductsReturn.push(prodId);
					prodId = "";
					boolStartNum = false;
				} ;
			};
		};
	} else {
		if (getStoreProductsResult.indexOf("{\"StoreCategoryEntries\":[]}") > -1) {
			// this is a test data set for all subcategories
			// getStoreProductsResult = "{\"StoreCategoryEntries\": [661651456, 693370880, 693567489, 696844288]}";
		};
		// this is a test data set for one subcategory
		/*
		if ( thisCatId == 36 ) {
			getStoreProductsReturn[0] = 661651456;
			getStoreProductsReturn[1] = 693370880;
			getStoreProductsReturn[2] = 693567489;
			getStoreProductsReturn[3] = 696844288;
			getStoreProductsReturn[4] = 700710912;
			getStoreProductsReturn[5] = 701497344;
			getStoreProductsReturn[6] = 701562880;
			getStoreProductsReturn[7] = 636420096;
		};
		*/
	};	
	return getStoreProductsReturn;
};
//-------------------------------------------------
//
// end API_SERVICE API functions
//
//-------------------------------------------------
/////////////////////////////////////////////////
//
//	START API_SERVICE TEST RUN
//
/////////////////////////////////////////////////
async function testRun(){
	var boolAbort = false;
	gsSUMMARY_REPORT = "API_SERVICE SERVICES TEST RESULTS FOR (" + doDate() + ")\n";
	gsSUMMARY_REPORT += "---------------------------------------------------\n";
	/////////////////////
	// LOGIN TO API_SERVICE
	////////////////////
	await loginAPI();
	///////////////////////////////////////////////////////////
	// IF THERE'S LOGIN ERROR PUT IT IN REPORT, STOP THE TEST
	///////////////////////////////////////////////////////////
	if (gaLOGIN_ARRAY[3] != "ERROR") {
		gsSUMMARY_REPORT += "PASS: LOGIN STATUS = SUCCESS\n";
		gsSUMMARY_REPORT += "SESSIONID: " + gaLOGIN_ARRAY[3] + "\n";
		gsSUMMARY_REPORT += "REFRESH TOKEN: " + gaLOGIN_ARRAY[4] + "\n";
	} else {
		gsSUMMARY_REPORT += "FAIL: LOGIN STATUS = " + gaLOGIN_ARRAY[4] + "\n";
		boolAbort = true;
	};
	///////////////////////////////////////////
	// IF THERE'S OTP REQUIRED, STOP THE TEST
	///////////////////////////////////////////
	if (gaLOGIN_ARRAY[3]=="OTP_REQUIRED") {
		gsSUMMARY_REPORT += "OTP REQUIRED - TEST ENDED\n";
		boolAbort = true;
	};
	/////////////////////////////////////
	// IF ABORT FLAG IS TRUE, STOP TEST
	// IF ABORT FLAG IS FALSE, CONTINUE
	////////////////////////////////////
	if (boolAbort == false) {
		//////////////////////////////////////////
		// STORE SERVICE CALLS
		//////////////////////////////////////////
		let resultGetStoreCategories = await getStoreCategories();
		if (Array.isArray(resultGetStoreCategories)) {
			if (resultGetStoreCategories.length > 0) {
				gsSUMMARY_REPORT += "PASS: STORE CATEGORIES FOUND\n";
				var boolSubCategoriesFound = false;
				var logStoreCategories = "Store Category IDs found: ";
				resultGetStoreCategories.forEach(element => logStoreCategories += (element[0] + " : " + element[1] + ", "));
				if (logStoreCategories.charAt(logStoreCategories.length-2)==",") { 
					logStoreCategories = logStoreCategories.substring(0,logStoreCategories.length-2);
				};
				doLog(logStoreCategories);
				for (let i = 0; i < resultGetStoreCategories.length; i++) {
					let resultSubCategories = await getStoreSubCategories(resultGetStoreCategories[i][0]);
					if (Array.isArray(resultSubCategories)) {
						if (resultSubCategories.length > 0) {
							boolSubCategoriesFound = true;
							var logStoreSubCategories = "Category ["+resultGetStoreCategories[i][1]+"] contains Subcategories: "
							for (let j = 0; j < resultSubCategories.length; j++) {
								logStoreSubCategories += resultSubCategories[j][0] + ":"+ resultSubCategories[j][1] + ", ";
								resultGetStoreCategories[i].push(resultSubCategories[j]);
							};
							if (logStoreSubCategories.charAt(logStoreSubCategories.length-2)==",") { 
								logStoreSubCategories = logStoreSubCategories.substring(0,logStoreSubCategories.length-2);
							};
							doLog(logStoreSubCategories);
						};
					};
				};
			} else {
				gsSUMMARY_REPORT += "POSSIBLE FAIL: NO STORE CATEGORIES FOUND\n";
			};
			if (boolSubCategoriesFound) {
				gsSUMMARY_REPORT += "PASS: STORE SUBCATEGORIES FOUND\n";
			} else {
				gsSUMMARY_REPORT += "POSSIBLE FAIL: NO STORE SUBCATEGORIES FOUND\n";
			};
		};
		var boolProductsFound = false;
		let arrayProducts = await getStoreProducts(resultGetStoreCategories);
			if (Array.isArray(arrayProducts)) {
				if (arrayProducts.length > 0) {
					boolProductsFound = true;
				};
			};
		if (boolProductsFound) {
			gsSUMMARY_REPORT += "PASS: STORE PRODUCTS FOUND\n";
		} else {
			gsSUMMARY_REPORT += "POSSIBLE FAIL: NO STORE PRODUCTS FOUND\n";
		};
	};
	/////////////////////////////////////////////
	// DISPLAY SUMMARY REPORT ON THE APP CONSOLE
	/////////////////////////////////////////////
	console.log("\n" + gsSUMMARY_REPORT + "\n");
	gsSUMMARY_REPORT += "\n\n\n\nsource code: http://" + webhostname + ":" + app_port + "/viewsource";
	return(gsSUMMARY_REPORT);
};
/////////////////////////////////////////////////
//
//	END API_SERVICE TEST RUN
//
/////////////////////////////////////////////////