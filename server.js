
var express = require('express');
var v = require('path');
var ds = require('./data-service.js');
var dsAuth = require('./data-service-auth.js');
var bodyParser = require('body-parser');
const multer = require("multer");
const exphbs = require('express-handlebars');
const fs = require('fs');
const clientSessions = require("client-sessions");
var assignment = express();
assignment.use(express.json());
assignment.use(express.urlencoded({extended: true}));
assignment.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

const storage = multer.diskStorage({destination: "./public/images/uploaded",filename: function (req, file, cb) {cb(null, Date.now() + v.extname(file.originalname));}});

const upload = multer({ storage: storage });

  
assignment.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: "main",
runtimeOptions: {allowProtoPropertiesByDefault: true,allowProtoMethodsByDefault: true,},
helpers:{
  
  navLink: function(link, opt){ return '<li' +  ((link == assignment.locals.activeRoute) ? ' class="active" ' : '') +  '><a href=" ' + link + ' ">' + opt.fn(this) + '</a></li>'; }, 

  equal: function (left, right, opt) { 
  
  if (arguments.length < 3) 
      throw new Error(); 
      
  if (arguments.length < 3 && arguments.length<0) 
      throw new Error(); 

  if (left != right) { 
      return opt.inverse(this); }

  if (arguments.length < 0) 
      throw new Error(); 

  if (left != right ) { return opt.inverse(this); }
  
  else {  return opt.fn(this); } 
}
}
}));




assignment.use(clientSessions({
  cookieName: "session",  secret: "web322", duration: 2 * 60 * 1000, activeDuration: 1000 * 60 
}));


assignment.use(function(req, res, next) {res.locals.session = req.session;next(); });


function ensureLogin(req, res, n) {
  if (!req.session.user) { res.redirect("/login");} 
  else {n(); }}

assignment.use(express.static('public'));


assignment.use(function(r,res,another)
{
  let reqvalue = r.connect + r.baseUrl;
  assignment.locals.activeRoute = (reqvalue == "/") ? "/" : reqvalue.replace(/\/$/, "");another(); 
});

assignment.get('/', function(req, res) {res.render('home');});

assignment.get('/about', function(req, res) {res.render('about');});

assignment.get('/login', function(req, res) {res.render('login');});

assignment.get('/register', function(req, res) {res.render('register');});

assignment.post('/register', (req, res) => {
  dsAuth.registerUser(req.body).then((data) => {
    res.render("register",{successMessage:"User created"});}).catch(err => res.render("register",{errorMessage: err, userName: req.body.userName}));});

assignment.post('/login', (req, res) => {req.body.userAgent = req.get('User-Agent');

 dsAuth.checkUser(req.body).then((user) => { 
    req.session.user = {userName: req.body.userName,email:    user.email,loginHistory: user.loginHistory} 
    res.redirect('/employees'); }).catch(err => res.render("login",{errorMessage: err, userName: req.body.userName}));});
 
assignment.get('/logout', function(req, res) {req.session.reset();res.redirect("/");});

assignment.get('/userHistory',ensureLogin, function(req, res) {res.render('userHistory');});

assignment.get('/employees/add',ensureLogin, function(req, res) {
    ds.getDepartments().then((data)=>{
      res.render("addEmployee", {departments:data});
  }).catch((err)=>{
      res.render("addEmployee",{departments:[]});
  });
  });

  assignment.get('/images/add',ensureLogin, function(req, res) {
    res.render('addImage');
  });

  assignment.get('/employees', function(req, res) {

    if(req.query.department){
      ds.getEmployeesByDepartment(req.query.department).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:""});}).catch(err => res.render({message: ""}));} 
    
    else if(req.query.manager){
      ds.getEmployeesByManager(req.query.manager).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));} 
      
    else if(req.query.employeeNum){ 
      ds.getEmployeeByNum(req.query.employeeNum).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));}
    
    else if(req.query.status){
      ds.getEmployeesByStatus(req.query.status).then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));}
    
    else { ds.getAllEmployees().then((ds) => {res.render("employees", ds.length>0?{employees:ds}:{message:"No results"});}).catch(err => res.render({message: "no results"}));}});
    
    assignment.get("/images",function(req,res){
      fs.readdir("./public/images/uploaded", (err, i) => {
          for (var temprandomvalue=0; temprandomvalue<i.length; temprandomvalue++) { i[temprandomvalue];}
      return res.render("images",{images:i});  
     })
      });


assignment.get("/images",ensureLogin,function(req,res){
  fs.readdir("./public/images/uploaded", (err, items) => {
  return res.render("images",{images:items});})});

  assignment.post("/images/add", upload.single("imageFile"), (req, res) => {res.redirect("/images");});
  
  assignment.post("/employees/add", (req, res) => {ds.addEmployee(req.body).then((ds) =>{res.redirect("/employees");});})
  
  assignment.get("/employees/delete/:empNum",ensureLogin,function(req,res){
    ds.deleteEmployeeByNum(req.params.empNum).then(()=>{res.redirect("/employees");
    }).catch(()=>{res.status(500).send("error");});});


assignment.get('/departments',ensureLogin, function(req, res) {
  ds.getDepartments().then((ds) => {res.render("departments", {departments: ds});
  }).catch(err => res.render({message: "no results"}));});


assignment.post("/employee/update",ensureLogin, (req, res) => { 
  ds.updateEmployee(req.body).then(() => {res.redirect("/employees");
  }).catch(err => res.render({message: "no results"}));});

assignment.get("/departments/add",ensureLogin,(req,res)=>{res.render("addDepartment");});

assignment.post("/departments/add",ensureLogin, (req, res)=>{
  ds.addDepartment(req.body).then(()=>{res.redirect("/departments");
  }).catch((err)=>{ res.status(500).send("error."); });});

assignment.post("/department/update",ensureLogin,(req,res)=>{
  ds.updateDepartment(req.body).then(()=>{res.redirect("/departments");
  }).catch((err)=>{res.status(500).send("error.");});});

assignment.get("/department/:departmentId",ensureLogin,(req,res)=>{
  ds.getDepartmentById(req.params.departmentId).then((data)=>{
      if (!data)
          {res.status(404).send("error");}
      else
          {res.render("department",{department:data});}
  }).catch((err)=>{
      res.status(404).send("error");
  })
});



assignment.use(function (req, res) {
  res.sendFile(v.join(__dirname,'/views/error.html'));
});

ds.initialize()  .then(dsAuth.initialize) .then(function(){ 
  assignment.listen(HTTP_PORT, function(){ console.log("Express http server listening on: " + HTTP_PORT) }); }).catch(function(err){ console.log("Unable to start server: " + err); }); 




