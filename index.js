const express=require('express');
const app=express();
const server = require('http').createServer(app)
const port = process.env.PORT || 9000
const sql = require('mysql2')
const path = require('path')

const session = require('express-session')
var bodyParser = require('body-parser');
const { dirname } = require('path');

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
    password: "SQL@Sohan2002",
    database: "pbl",
    insecureAuth: true
});
con.connect((err) => {
    if (err) throw err;
    console.log("connected to my sql")
})

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
            req.session.username = username
            res.json({ login: req.session.loggedin, username: req.session.username })
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

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/')
        if (err) throw err
    })
})

app.get('/menu',(req,res)=>{
    res.sendFile(path.join(__dirname)+"/public/menu/menu.html");
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
