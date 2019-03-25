const express = require('express');
const bodyparser = require('body-parser');
const nodemon = require('nodemon');
const pg = require('pg');
const app = express();
const crypto = require('crypto');
var query_handler = require('./server');
var Test = require('./Test');
const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const path = require('path');
var unique_id;
var unique_name;
var query_string;
var resp;
var app_no;
var verbal_no;
var correct_ans;
var flag;



app.use(function (request, response, next) {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.header("Access-Control-Allow-Credentials", true);
    next();
});




app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.post('/register', async (req, res) => {
    var token = crypto.randomBytes(32).toString('base64');
    var unique_name = token.toString().slice(0, 6);
    console.log(unique_name);
    var token = crypto.randomBytes(32).toString('base64');
    var unique_id = token.slice(0, 4);
    console.log(unique_id);
    query_string = `insert into registration(name,date_of_birth,email,contact_number,college_name,college_id,degree,unique_name,unique_id)
values('${req.body.name}','${req.body.date_of_birth}','${req.body.email}','${req.body.contact_number}','${req.body.college_name}',
'${req.body.college_id}','${req.body.degree}','${unique_name}','${unique_id}')`;
    console.log(query_string);
    resp = await query_handler(query_string);
    console.log(resp.rowCount)
    if (resp.rowCount === 1) {
        query_string = `select * from registration where email='${req.body.email}'`;
        let output = await query_handler(query_string);
        // console.log(output.rows)
        sendMail(output.rows[0])
        res.status(200).send('success');
    }

    else
        res.status(400).send('failure');
})
app.post('/login', async (req, res) => {
    query_string = `select student_id, name,date_of_birth,email,contact_number,college_name,college_id,degree from registration 
    where unique_name='${req.body.unique_name}' AND unique_id='${req.body.unique_id}'`;
    resp = await query_handler(query_string, "registration");
    console.log(resp);
    if (resp.rowCount === 1)
        res.status(200).send(JSON.parse(`{"student_id":"${resp.rows[0].student_id}","name":"${resp.rows[0].name}","date_of_birth":"${resp.rows[0].date_of_birth}","email":"${resp.rows[0].email}","contact_number":"${resp.rows[0].contact_number}"
,"college_name":"${resp.rows[0].college_name}","college_id":"${resp.rows[0].college_id}","degree":"${resp.rows[0].degree}"}`));
    else
        res.status(400).send("failure");
})

// function sendMail(obj) {

//     var api_key = '62b50189fe5186c88681fdef72578d5d-9ce9335e-1e4e69f2';
//     var domain = 'sandbox99f3f423edfb4d3bb064c6c15bfa9dfb.mailgun.org';



//     var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
//     console.log("The email data:", obj.email);

//     var data = {
//         from: 'Online exam portal <yashwanthirg@gmail.com>',
//         to: `${obj.email}`,
//         subject: 'user id and password',
//         text: `${obj.unique_name},${obj.unique_id}`
//     };
//     //console.log("Thedata:",data)
//     mailgun.messages().send(data, function (error, body) {
//         if (error) {
//             console.log(error);
//         }

//         console.log(body);
//     });
//}


app.post('/upload', async (req, res) => {
    if (req.body.type === 'apptitude') {
        query_string = `insert into apptitude(question,option_a,option_b,option_c,option_d,correct_ans) 
    values('${req.body.question}','${req.body.option_a}','${req.body.option_b}',
    '${req.body.option_c}','${req.body.option_d}','${req.body.correct_ans}')`;
        resp = await query_handler(query_string);
        if (resp.rowCount === 1)
            res.status(200).send('success');
        else
            res.status(400).send('failure');
    }
    else {
        query_string = `insert into verbal(question,option_a,option_b,option_c,option_d,correct_ans) 
    values('${req.body.question}','${req.body.option_a}','${req.body.option_b}',
    '${req.body.option_c}','${req.body.option_d}','${req.body.correct_ans}')`;
        resp = await query_handler(query_string);
        if (resp.rowCount === 1)
            res.status(200).send('success');
        else
            res.status(400).send('failure');
    }

});

app.post('/get_question', async (req, res) => {
    if (req.body.negative_marking === 'yes')
        flag = 1;
    else
        flag = 0;
    console.log(flag);
    if (req.body.type === 'apptitude') {
        query_string = `select * from apptitude order by random() limit ${req.body.no}`;
        console.log(query_string);
        resp = await query_handler(query_string);
        if (resp.rowCount >= 1) {
            console.log(resp.rows);
            res.status(200).send(resp.rows)
        }
        else
            res.status(400).send('failure');
    }
    else {
        query_string = `select * from verbal order by random() limit ${req.body.no}`;
        console.log(query_string);
        resp = await query_handler(query_string);
        if (resp.rowCount >= 1) {
            console.log(resp.rows);
            res.status(200).send(resp.rows)
        }
        else
            res.status(400).send('failure');
    }

});
app.post('/on_submit', async (req, res) => {
    var submit_data_temp = req.body.submit_data;
    var count = 0;
    var score = 0;
    for (var i = 0; i < Object.keys(submit_data_temp).length; i++) {
        console.log(i, req.body.submit_data[i]);
        query_string = `insert into answers(student_id,question_id,type,answer,score) 
            values ('${req.body.student_id}','${req.body.submit_data[i].question_id}','${req.body.submit_data[i].type}','${req.body.submit_data[i].answer}','${score}')`;
        resp = await query_handler(query_string);

        console.log(resp.rows);
        query_string = `select correct_ans from ${submit_data_temp[i].type} where question_id=${req.body.submit_data[i].question_id}`;
        resp = await query_handler(query_string);
        console.log(resp.rows);
        console.log(query_string);
        if (resp.rowCount >= 1) {
            count = count + 1;
            if (submit_data_temp[i].answer === resp.rows[0].correct_ans) {
                console.log('answer is correct');
                query_string = `update answers set score = 1 where type='${req.body.submit_data[i].type}' AND question_id=${req.body.submit_data[i].question_id}`;
                resp = await query_handler(query_string);
                console.log(query_string);

            }
            else {
                console.log('answer is wrong');
                if (flag === 0) {
                    query_string = `update answers set score=0  where type='${req.body.submit_data[i].type}' AND  question_id=${req.body.submit_data[i].question_id}`;
                    resp = await query_handler(query_string);
                    console.log(query_string);
                }
                else {
                    query_string = `update answers set score=-1 where type='${req.body.submit_data[i].type}' AND  question_id=${req.body.submit_data[i].question_id}`;
                    resp = await query_handler(query_string);
                    console.log(query_string);

                }
            }


        }

        else
            res.status(400).send('failure');
    }
    if (count === Object.keys(submit_data_temp).length) {
        res.status(200).send("success");

    }
});

app.post('/result', async (req, res) => {
    query_string = `select sum(score) from answers  where student_id =${req.body.student_id}`;
    resp = await query_handler(query_string);
     console .log(resp.rows);
     resp = await query_handler(query_string);
     if (resp.rowCount >= 1) {
        res.status(200).send(resp.rows);
    }
    else
        res.status(400).send('failure');
});


app.post('/history', async (req, res) => {
    query_string = `insert into history(test_id,student_id,test_date,start_time,end_time,score)
    values('${req.body.test_id}','${req.body.student_id}','${Test.getDate()}','${Test.getTime()}','${req.body.end_time}','${req.body.score}')`;
    resp = await query_handler(query_string);
    console.log(query_string);
    if (resp.rowCount === 1)
        res.status(200).send('success');
    else
        res.status(400).send('failure');

});






app.post('/signup', async (req, res) => {
    query_string = `insert into admin(name,email,password,contact_number,acc_type)
values('${req.body.name}','${req.body.email}','${req.body.password}','${req.body.contact_number}','${req.body.acc_type}')`;
    resp = await query_handler(query_string);
    if (resp.rowCount === 1)
        res.status(200).send('success');
    else
        res.status(400).send('failure');
})
app.post('/signin', async (req, res) => {
    query_string = `select admin_id, name,email,contact_number,password from admin where email='${req.body.email}'`;
    resp = await query_handler(query_string, "registration");
    if (resp.rowCount === 1 && resp.rows[0].password === req.body.password)
        res.status(200).send(JSON.parse(`{"admin_id":"${resp.rows[0].admin_id}","name":"${resp.rows[0].name}","email":"${resp.rows[0].email}","contact_number":"${resp.rows[0].contact_number}"}`));
    else
        res.status(400).send("Failure");
})


   
    
const compile = async function(templateName,data){
    const filePath=path.join(process.cwd(),`${templateName}.hbs`);
    const html= await fs.readFile(filePath, 'utf-8');
    console.log(html);


return hbs.compile(html)(data);



};


app.post('/pdf',async(req,res)=>{
    query_string = `select * from registration where student_id = '${req.body.student_id}'`;
        resp = await query_handler(query_string)
        if (resp.rowCount === 1) {
            console.log("comming here");
            var name = resp.rows[0].name;
            var colg = resp.rows[0].college_name;
            var colg_id = resp.rows[0].college_id;
            var dob = resp.rows[0].date_of_birth;
           var email = resp.rows[0].email;
             var contact = resp.rows[0].contact_number;
        }
        query_string=`select * from `
    var data=`<style>h1{color:blue}</style>
    <h1>Hi ${name} your report analysis is </h1>
              <table> <tr> NAME:</tr> <td>${name}</td><tr> COLLEGE:</tr><td>${colg}</td> 
               <tr>EMAIL:</tr><td>${email}</td><tr> CONTACT:</tr><td>${contact}</td></table>

                <table> <tr> <th>NAME</th> <th>SCORE</th> </tr>
                <tr><td>${name}</td><td>45</td></tr></table>`;
fs.writeFile('shot-list.hbs', data) ;
    
    try{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const content= await compile('shot-list',data);
        await page.setContent(content);
        await page.emulateMedia('screen');
        await  page.pdf({
            path:`${name}.pdf`,
            format:'A4',
            printBackground: true
        });
        console.log('done');
        await browser.close();
        process.exit();
            

        }catch(e){
            console.log( 'the error is', e);
        }
    });

app.post('/get_count',async(req,res)=>{
    query_string=`select count(student_id) from registration`;
    resp= await query_handler(query_string);
    console.log(resp.rows);
    if (resp.rowCount >= 1) {
        res.status(200).send(resp.rows);
    }
    else
        res.status(400).send('failure');
});

    
app.post('/get_count_question',async(req,res)=>{
    var type;
    if(req.body.type==='apptitude'){
        query_string = ` select count  (question_id)from apptitude`;
        resp = await query_handler(query_string);
        console.log(resp.rows);
    }
    if(req.body.type==='verbal'){
        query_string = `  select count (question_id)from verbal`;
        resp = await query_handler(query_string);
        console.log(resp.rows);

    }


})



app.post('/total score',async(req,res)=>{
    query_string=`insert into score(student_id,apptitude,vebal,total)
    values('${req.body.student_id}',(select sum(score)from answers where student_id=${req.body.student_id} and type='apptitude'),select sum(score) from answers where student_id=${req.body.student_id} and type='verbal'),select sum(score) from answers where student_id=${req.body.student_id})`;
resp = await query_handler(query_string);
if (resp.rowCount >= 1) {
    res.status(200).send(resp.rows);
}
else
    res.status(400).send('failure');
});



app.listen(3000, () => {
    console.log('server started');
})
module.exports = app;
    