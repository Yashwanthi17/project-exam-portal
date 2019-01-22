const express = require('express');
const bodyparser = require('body-parser');
const nodemon = require('nodemon');
const pg = require('pg');
const app = express();
var query_string;
var resp;
var query_handler = require('./server');
var shortid = require('short-id');
var unique_id;
var username = require('username-generator');
var unique_name;




app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
    unique_name = username.generateUsername();
    console.log(unique_name);
    unique_id = shortid.generate();
    console.log(unique_id);

    query_string = `insert into registration(name,date_of_birth,email,contact_number,college_name,college_id,degree,unique_name,unique_id)
values('${req.body.name}','${req.body.date_of_birth}','${req.body.email}','${req.body.contact_number}','${req.body.college_name}',
'${req.body.college_id}','${req.body.degree}','${unique_name}','${unique_id}')`;
    resp = await query_handler(query_string);
    if (resp.rowCount === 1)
        res.status(200).send('success');
    else
        res.status(400).send('failure');
    


})
app.post('/login', async (req, res) => {
    query_string = `select student_id, name,date_of_birth,email,contact_number,college_name,college_id,degree from registration 
    where unique_name='${req.body.unique_name}' AND unique_id='${req.body.unique_id}'`;
    resp = await query_handler(query_string,"registration");
    console.log(resp);
    if (resp.rowCount === 1)
    res.status(200).send(JSON.parse(`{"student_id":"${resp.rows[0].student_id}","name":"${resp.rows[0].name}","date_of_birth":"${resp.rows[0].date_of_birth}","email":"${resp.rows[0].email}","contact_number":"${resp.rows[0].contact_number}"
,"college_name":"${resp.rows[0].college_name}","college_id":"${resp.rows[0].college_id}","degree":"${resp.rows[0].degree}"}`));    
else
        res.status(400).send("failure");
})


app.listen(3000, () => {
    console.log('server started');
});



module.exports = app;  


