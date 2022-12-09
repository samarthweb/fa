


const Sequelize = require("sequelize");

var sequelize = new Sequelize('olazbtue', 'olazbtue', 't9Ayv7MsyPbcZeqksMZNsyC-4lIVQ6K0', {
  host: 'lucky.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialiectOptions: {ssl: {
    require: true,
    rejectUnauthorized: false
  }},
  });


sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));



var Employee = sequelize.define("Employee", {
    employeeNum:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define("Department",{
    departmentId:{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
});



module.exports.initialize = function () {
return new Promise((resolve, reject) => {sequelize.sync().then(()=>{resolve();}).catch(()=>{reject(""); });});};


module.exports.getAllEmployees = function () {
  return new Promise(function (resolve, reject) {
    Employee.findAll().then((info)=>{resolve(info);}).catch((err)=>{ reject("");}); });};



module.exports.getDepartments = function () {
  return new Promise(function (resolve, reject) {
    Department.findAll().then((info)=>{resolve(info);}).catch((err)=>{reject("")});});};


module.exports.addEmployee = function(info) {
  return new Promise(function (resolve, reject) {
    info.isManager = (info.isManager)?true:false;        
        for (let randomvalue in info)
            {
                var value=0;
                if (info[randomvalue]!=""){value++;}    
                if (info[randomvalue]=="") {info[randomvalue] = null;}
            }
    Employee.create(info).then(()=>{resolve();}).catch((err)=>{reject("");}); });}

module.exports.getEmployeesByStatus = function(s) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({where:{status:s}}).then((info)=>{resolve(info);}).catch((err)=>{ reject("");});});}


module.exports.getEmployeesByDepartment = function(d) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({where: {department: d}}).then((info)=>{resolve(info);}).catch((err)=>{reject("") });});}

module.exports.getEmployeesByManager = function(m) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({where:{employeeManagerNum: m} }).then((info)=>{resolve(info);}).catch((err)=>{reject("");});});}


module.exports.getEmployeeByNum = function(v) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({where:{employeeNum: v}}).then((data)=>{resolve(data[0]);}).catch((err)=>{reject("")});});}

module.exports.deleteEmployeeByNum = function(n){
  return new Promise((resolve, reject)=>{
    Employee.destroy({where: {employeeNum: n}}).then(()=>{resolve();}).catch((err)=>{reject(""); });})}


module.exports.updateEmployee = function(info) {
    return new Promise((resolve,reject) => {
        info.isManager = (info.isManager) ? true : false;

        for (var i in info) {
            if (info[i] == "") { info[i] = null; }
        }

        sequelize.sync()
        .then(Employee.update(info, {where: {
            employeeNum: info.employeeNum
        }}))
        .then(resolve(Employee.update(info, { where: { employeeNum:info.employeeNum }})))
        .catch(reject(''))
    })
  }


module.exports.addDepartment= function(info){
  return new Promise((resolve, reject)=>{
     for (let i in info)
     { if (info[i]=="") { info[i] = null;} }
     Department.create(info).then(()=>{
         resolve();
     }).catch((err)=>{ 
         reject("");
     });
  });
}

module.exports.updateDepartment=function(info){
  return new Promise((resolve, reject)=>{
      for (let i in info){ if (info[i]=="") { info[i] = null;} }
     Department.update(info,{where: {departmentId: info.departmentId}}).then(()=>{ resolve();}).catch((err)=>{reject("");});});}


module.exports.getDepartmentById=function(id){
  return new Promise((resolve, reject)=>{
      Department.findAll({where: {departmentId: id}}).then((data)=>{ resolve(data[0]); }).catch((err)=>{reject("");});});}

