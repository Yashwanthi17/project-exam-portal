const pg = require('pg');
const pool = new pg.Pool({
    user: 'online_portal',
    host: 'localhost',
    database: 'reg_details',
    password: '123',
    port: '5432'
});

const pool1=new pg.Pool({
    user:'online_portal',
    host:'localhost',
    database:'questions',
    password:'123',
    port:'5432'
});

function query_handler(query_string,db_name){
    if(db_name==="questions"){
        return new Promise ((resolve,reject)=>{
            pool1.query(query_string,(err,data)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            })
        })
    }else{
        return new Promise ((resolve,reject)=>{
            pool.query(query_string,(err,data)=>{
                if(err){
                    reject(err)
                }else{
                    resolve(data)
                }
            })
        })
    }
    
}

module.exports = query_handler;

