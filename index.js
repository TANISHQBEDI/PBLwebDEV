const express=require('express');
const app=express();
const server = require('http').createServer(app)
const port = process.env.PORT || 9000
const sql = require('mysql2')
const path = require('path')

const session = require('express-session')
var bodyParser = require('body-parser');
const { dirname } = require('path');

let loginstatus=false;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.set('views','./public');
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname + '/public')))

// sql config

var con = sql.createConnection({
    host: "localhost",
    user: "root",
    
    password: "agrawal05",
    database: "pbl",
    insecureAuth: true
});
con.connect((err) => {
    if (err) throw err;
    console.log("connected to my sql")
})




  let createUsers=`create table if not exists users(
      ID int primary key auto_increment,
      USERNAME varchar(100) not null,
      EMAIL varchar(100) not null,
      PASSWORD varchar(250) not null
  )`

  con.query(createUsers, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

  let createPro = `create table if not exists products
  (
    id int primary key auto_increment,
    items varchar(255) not null,
    cost double not null
  )`;

con.query(createPro, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT IGNORE INTO products (id,items,cost) VALUES ?";
    var values = 
    [ ['111','frenchfries','67.0'],
      ['112','clubsandwich','100.0'],
      ['113','pasta','67.0'],   
      ['114','masalapapad','100.0'],
      ['115','tomatosoup','100.0'],
      ['116','chickenlolipop','90.0'],
      ['211','butterchicken','200.0'],
      ['212','tandoori','170.0'],
      ['213','paneerbuttermasala','175.0'],
      ['214','paneerlababdar','190.0'],
      ['215','dalmakhani','150.0'],
      ['216','sarsokasaag','200.0'],
      ['311','chocolatepastery','150.0'],
      ['312','kasata','70.0'],
      ['313','kulfi','65.0'],
      ['314','vanillaicecream','80.0'],
      ['315','brownie','125.0'],
      ['316','pancake','150.0'],
      ['411','mojito','150.0'],
      ['412','fruitjuice','45.0'],
      ['413','soda','75.0'],
      ['414','mocktail','165.0'],
      ['415','mangomilkshake','100.0'],
      ['416','lassi','80.0']
    ];
    if(con.query)
    con.query(sql, [values], function(err, result) {
      if (err) throw err;
      console.log("Number of records inserted: " + result.affectedRows);
    });
  });


app.get('/', (req, res) => {
    res.render('index',{'username':req.session.username});

})

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname)+"/public/login/login.html");
})



app.get('/sign-in', (req, res) => {
    let username = req.query.username;
    let password = req.query.password;
    console.log(username + " " + password)
    con.query(`SELECT * FROM users WHERE USERNAME=? AND PASSWORD=?`, [username, password], (err, result, fields) => {
        if (err) throw err;
        if (result[0] != undefined) 
        {
            req.session.loggedin = true
            loginstatus=req.session.loggedin = true;
            req.session.username = username
            res.json({ login: req.session.loggedin, username: req.session.username })
            console.log(loginstatus);
        } 
        else 
        {
            console.log("Wrong Credentials")
            res.json({ login: req.session.loggedin })
        }
    })

})

app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname)+"/public/register/register.html");
})
app.post('/sign-up', (req, res) => {
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let confirmPassword = req.body.passwordConfirm
    console.log(req.body)
        con.query('SELECT * FROM users WHERE USERNAME=? OR EMAIL=?', [username, email], (err, result, fields) => {
            if (err) throw err;
            console.log(result)
            if (result[0] == undefined) 
            {
                con.query(`INSERT INTO users (USERNAME, EMAIL, PASSWORD) VALUES ("${username}", "${email}", "${password}")`, (err, result, fields) => {
                    if (err) throw err;
                    console.log(result)
                    console.log("Account Created")
                    res.json({ status: true })
                })
            } 
            else 
            {
                res.json({ status: false, message: "Username or Email already used." })
            }
        })
    
})

app.post('/menuLogIn',(req,res)=>{
    let item = req.body.item;
    con.query(`INSERT INTO products (item) VALUES ("${item}")`)
})

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/')
        if (err) throw err
        loginstatus=false;
    })
})
// console.log(loginstatus);
// if(loginstatus==false)
// {
//     app.get('/menu',(_req,res)=>{
//         res.sendFile(path.join(__dirname)+"/public/menu/menu.html");
//     })
//     console.log("IN if condition");
// }
// else{
//     app.get('/menuLoggedIn',(_req,res)=>{
//         res.sendFile(path.join(__dirname)+"/public/menu/menuLoggedIn.html");
//     })
//     console.log("IN else condition");
// }

app.get('/menu',(req,res)=>{
    if(loginstatus!=true){
        res.sendFile(path.join(__dirname)+"/public/menu/menu.html");
        console.log("IN if condition");
    }
    else{
        res.sendFile(path.join(__dirname)+"/public/menu/menuLoggedIn.html");
        console.log("IN else condition");
    }
})

app.get('/about',(req,res)=>{
        res.sendFile(path.join(__dirname)+"/public/about/about.html");
})

app.get('/contact',(req,res)=>{
    res.sendFile(path.join(__dirname)+"/public/contact/contact.html");
})

const isAuth = (req, res, next) => {
    if (req.session.loggedin) {
        next()
    } else {
        res.redirect("/login/login.html")
    }
}

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
