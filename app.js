var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var { createServer } = require("http");
var stockRouter = require('./routes/stock');
var transaksiRouter = require('./routes/transaksi');
var agRouter = require('./routes/ag');

let portNumber=3420;
let originArr=['http://localhost:4200',"https://gcondrow.github.io"];

var app = express();

const httpServer = createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer, { 
	cors:{
		credentials: true,
		origin:originArr,
	},
	connectionStateRecovery: {
		maxDisconnectionDuration: 2 * 60 * 1000,
	},
});
class idPrototype{
	constructor(path){
		this.key=path;
		let LocalStorage=require('node-localstorage').LocalStorage;
		this.db=new LocalStorage("./db/localDb");
		if(!this.getValue()){
			this.db.setItem(this.key, '1');
			this.value=this.getValue();
		}else{
			this.value=this.getValue();
		};
	};
	up=()=>{
		this.value=(Number(this.db.getItem(this.key))+1).toString();
		this.db.setItem(this.key, this.value);
		return this.value;
	};
	getValue=()=>{
		this.value=this.db.getItem(this.key);
		return this.value;
	};
	clearValue=()=>{
		this.db.clear(this.key);
		delete(this.value);
		return this.value;
	};
};
let dbKey=new idPrototype("dbKey");
let userId=new idPrototype("userId");
let dbParity={};
let corsOptions={
	credentials: true,
	origin:originArr,
};
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/*app.get('/home', function(req, res,next) {
	try{
		console.log("AT /home")
		console.log("=>",path.join(__dirname + '/dist/app-angular-json-server/'))
		res.sendFile(path.join(__dirname + '/dist/app-angular-json-server/index.html'));
	}catch(e){
		
	};
});*/
//app.use(express.static(path.join(__dirname + '/dist/app-angular-json-server/')));
app.get('*.*',express.static(path.join(__dirname + '/dist/app-angular-json-server/')));
app.use('/key/:c?',function(req, res, next) {
	let debug=true;
	if (debug===true){
		let c=req.params.c;
		console.log("KEY C =>",c);
		if(c==="up")dbKey.up();
	};
	res.json(dbKey);
});
let middlewareArr=[
	(req,res,next)=>{
		console.log("MIDDLEWARE 1");
		req.app.io=io;
		req.app.dbKey=dbKey;
		console.log("REQ QUERY : ",req.query);
		console.log("REQ PARAM : ",req.params);
		next();
	},
	(req,res,next)=>{
		console.log("MIDDLEWARE 2 => AUTH");
		let clientDbKey=req.get('dbKey');
		console.log("clientDbKey | dbKey => ",clientDbKey+" | "+dbKey.value);
		if(clientDbKey!=dbKey.value){
			//console.log("AUTH FAIL ",next(createError(401)));
			io.emit('login');
			console.log("AUTH FAIL ");
			//throw new Error ("AUTHENTICATION_FAILED");
		}else{
			console.log("AUTH SUCCESS ",next());
		};
	},
];

app.use('/ag', agRouter);
app.use('/clearStorage',(req,res,next)=>{
	let debug=true;
	let testVar;
	if (debug===true){

	};
	res.json(dbKey.clearValue());
});
app.use('/localStorageUp',(req,res,next)=>{
	let debug=true;
	let testVar;
	if (debug===true){

	};
	res.json({dbKey:dbKey.up()});
});
app.use('/localStorage',(req,res,next)=>{
	let debug=true;
	let testVar;
	if (debug===true){

	};
	res.json({dbKey:dbKey});
});

app.use(middlewareArr,(req,res,next)=>{
	console.log("middleware");
	next();
});

app.use('/stock', stockRouter);
app.use('/transaksi', transaksiRouter);

//app.use('/stock/key', (req,res,next)=>res.json({id:12}));
//app.use('/', (req,res,next)=>res.redirect('/stock'));

app.use('/dbParity/',function(req, res, next) {
	let debug=true;
	if (debug===true){
		
	};
	res.json(dbParity);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	let temp={
		messagge:err.message,
		stack:err.stack,
		status:res.status,
	};
	console.log("Error App Level: ",temp)
	res.json({Error:temp});
});

io.on('connection', socket => {
	console.log(" ")
	console.log("====================================================")
	console.log("SOCKET CONNECTED = > ",socket.id);
	socket.on("login",(clientData,cb) => {
		console.log("CLIENTDATA = >",clientData);
		console.log("DBKEY = >",dbKey.value);
		console.log("LOGIN VALIDATION = >",clientData.dbKey,dbKey.value);
		if(clientData.dbKey!=dbKey.value){
			console.log("LOGIN FAILED");
			cb({success:false,dbKey:dbKey.value});
		}else{
			console.log("LOGIN SUCCESS");
			cb({success:true,dbKey:dbKey.value});
		};
	});
});

httpServer.listen(portNumber,()=>{
	console.log("Start, port :",portNumber);
});

module.exports = app,io;
/*
<minor bug>
+deleteAll routing issues
	expected=>stock
	observed=>daftar
	rep=>do delete all funct from mainOffcanvas ui
-inconsistent transaction table column length format
	expected=>auto adjust
	observed=>didnt adjust, short, inconsistent
	rep=>expand transaction modal
+filter resets after db operation
	expected=>filter persist
	observed=>reset to default
	rep=>do any db operations
</minor bug>

<improvement>
+Persistent server localStorage (API server)
	Store var that could be persisted such as dbKey in case server offline mid runtime 
-Better ag-grid (table) ui solution
	as of now table is auto adjusting length everytime rowData is updated, caused issue when doing navigation throught pagination
</improvement>
*/
