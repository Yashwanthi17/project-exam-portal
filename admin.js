const nodemon =require('nodemon');
const bodyparser=require('body-parser');
const express =require('express');
const pg=require('pg');
const app =express();


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));

app.post('/signup',async(req,res)=>
{
    query_string=
    

})