//importing modules
const express = require('express')
//const hbs = require('hbs');
const path = require('path');
const bodyparser = require('body-parser');
const mysql = require('mysql')
const hbs = require('express-handlebars');
const session = require('express-session');
const jwt =require('jsonwebtoken')
//-------------------------------------------------
//Node Mailer
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nodedevelopertestingemail@gmail.com',
    pass: 'gmail@123'
  }
});
//----------------------------------------------------
//creation app of express js
var app = express();
//configure view engine as hbs
app.set('views', path.join(__dirname, 'views')) //location
app.set('view engine', 'hbs') // set path (view engine,'ext-name')
//configure layouts in mainlayout as it imports in all of the pages

//----------------------------------------------------------------
app.use(express.static("views/images"))
//---------------------------------------------------------------
//start session----------
app.use(session({
  secret: 'asdfdfss'
}))
//---------------------------------------------------------------
//server configuration
//server creation and start server  ---listen(port no,function)------
app.listen(4000, () => {
  console.log("Server started on port :4000");
})

//configure body parser
app.use(bodyparser.json()) //enables to transfer data in Jason format
app.use(bodyparser.urlencoded({
  extended: true //upto the data length
}))
//-----------------------------------------
//creating connection in mysql
const con = mysql.createConnection({
  user: 'root',
  password: 'root',
  port: 3306,
  host: 'localhost',
  database: 'cms'

})
//-----------------------------------------------------------------------
app.get('/', (request, response) => {

          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();
          today = yyyy+'-' + mm + '-'+dd ;

          var expArray=[];
          var regiArray=[];
          var sql2="select * from accounts";
          sql2=mysql.format(sql2)
          con.query(sql2,(err,result)=>{
          for(var i=0;i<=result.length-1;i++)
           {
            //console.log(result[i]);
            expArray.push(result[i].expiry_date.split("-").reverse().join("-"));
            regiArray.push(result[i].registerd_date.split("-").reverse().join("-"));
           }


   if (err) throw err;
   else
   {
     console.log(expArray);
     console.log(regiArray);
for(var i=0;i<=expArray.length-1;i++)
{
    var expdate=expArray[i];
    console.log("Expiry date"+expdate);
    for (var j=1;j<=regiArray.length-1;j++)
       {
            var regidate=regiArray[i];
            console.log("Registration date"+regidate);
            var sql2="SELECT DATEDIFF(?,curdate()) as days";
            val=[expdate]
            sql2=mysql.format(sql2,val)
            con.query(sql2,(err,result)=>{
            console.log("date diff -----"+result);

    for(var i=0;i<=result.length-1;i++)
       {
             var shoot_day=result[i].days;
             console.log(shoot_day);
             console.log("shoot_day checking");
             if (shoot_day<=7)
             {
               console.log("if checked");
               var email='anuragsharma9826@gmail.com';
               var mailOptions = {
                 from: 'nodedevelopertestingemail@gmail.com',
                 to: email,
                 subject: 'Expiry date for CMS',
                 text: 'Hello '+email+" , your Registration for CMS server Management will expire in few date please re-new it .Thank you..!!!"
               };
               transporter.sendMail(mailOptions, function(error, info){
                    console.log("sending mail");

                //  if (error)
                //  {
                //    console.log(error);
                //  } else
                //  {
                //    console.log("sending mail");
                //    response.render('home')
                // }
              });//transporter end
            }//if end
        }//for i
         })//datediff query
}//for j
}//for i
response.render('home');
   }

 })//sql 1 query
})//end app.get
//-------------------------------------------------------------------
//--------------------------------------------------------------------
//------------------------------------------------------------------
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
app.get('/admin', (request, response) => {
  response.render('adminlogin')
})
//--------------------------------------------------------------------
app.get('/adminhome',(request, response)=>{if(request.session.admin==null){response.render('adminlogin')}else response.render('adminhome',{aid:request.session.admin})})
app.get('/customerhome',(request, response)=>{response.render('customerhome',{cid:request.session.customer})})
//-------------------------------------------------------------------------
//admin_login_check
//
app.post('/admin_login_check',(request,response)=>{
        var logid=request.body.username;
        var pwd=request.body.password;
        var sql="select * from admin where emailid=? and password=?"
        var values=[logid,pwd]
        sql=mysql.format(sql,values)
        con.query(sql,(err,result)=>{
          if (err) throw err;
          else if(result.length>0)
          {
          request.session.admin=logid;
          response.render('adminhome',{data:result,aid:request.session.admin,msg:"Welcome"});
          }
          else
          response.render('adminlogin',{msg:'login Fail,Try again'})
           })
})
//-------------------------------------------------------------------------
//---------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------
//------------------------------------------------------------------
//--------------------------------------------------------------------
//-------------------------------------------------------------------
//--------------------------------------------------------------------
//------------------------------------------------------------------
//---------------------------------------------------------------------------
 //--------------------------------------------------------------------
 //---------------------------------------------------------------------------
 //-------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//---------------------------------------------------------------------
//add_new_customers
app.get('/add_new_customers',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}

  response.render('add_new_customers',{aid:request.session.admin})
})
//---------------------------------------------------------------------
//add_new_customers_form
app.post('/add_new_customers_form',(request,response)=>{
  var cname=request.body.cname;
  var cemail=request.body.cemail;
  var mobile=request.body.mobile;
  var email='anuragsharma9826@gmail.com';
  //random pass word genration
  var chars = "abcdefghijklmnopqrstuvwxyz!@#$&ABCDEFGHIJKLMNOP1234567890";
  var password = "";
  for (var x = 0; x < 8; x++) {
      var i = Math.floor(Math.random() * chars.length);
      password += chars.charAt(i);
  }
  //console.log(pass);
  var sql="insert into customers (name,email,mobile,password) values(?,?,?,?)"
  var values=[cname,cemail,mobile,password]
  sql=mysql.format(sql,values)
  con.query(sql,(err)=>{
    if (err) throw err;
    else
    {
      console.log(password);
      var mailOptions = {
        from: 'nodedevelopertestingemail@gmail.com',
        to: email,
        subject: 'Password Genration for CMS',
        text: 'Hello '+email+" , your Registration for CMS server Management is successfully completed please login with your registerd email and  your passwword is "+password+"  .Thank you..!!!"
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error)
        {
          console.log(error);
        } else
        {
          response.render('add_new_customers',{msg:'Customer Added  Succesfully and Password is sent on your registerd mail id',aid:request.session.admin})
         // console.log('Email sent: ' + info.response);
        }
      });
    }
     })
})
//---------------------------------------------------------------------
//view_all_customers
app.get("/view_all_customers",(request,response)=>{
    var sql2="select * from customers";
    sql2=mysql.format(sql2)
    con.query(sql2,(err,result)=>{
     if (err) throw err;
     else
     response.render('view_all_customers',{data:result,aid:request.session.admin})

  })
})
//--------------------------------------------------------------------
///delete_customer
app.get("/delete_customer",(request,response)=>{
  email=request.query.email;
    var sql2="delete from customers where email=?";
    var values=[email]
    sql2=mysql.format(sql2,values)
    con.query(sql2,(err,result)=>{
     if (err) throw err;
     else{
       var sql2="select * from customers";
       sql2=mysql.format(sql2)
       con.query(sql2,(err,cresult)=>{
        if (err) throw err;
        else
        response.render('view_all_customers',{data:cresult,aid:request.session.admin})

     })
     }

  })
})
//------------------------------------------------------------------------
//search_by_name
app.get("/search_by_name",(request,response)=>{
  search=request.query.search+"%";
  // console.log(search);
    var sql2="select * from customers where name like ?";
    var values=[search]
    sql2=mysql.format(sql2,values)
    con.query(sql2,(err,result)=>{
      // console.log(result);
     if (err) throw err;
     else{

        response.json({data:result,aid:request.session.admin})

     }

  })
})
//---------------------------------------------------------------------
//add_new_plans
app.get('/add_new_plans',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}

  response.render('add_new_plans',{aid:request.session.admin})
})
//---------------------------------------------------------------------
//add_new_plans_form
app.post('/add_new_plans_form',(request,response)=>{
  var plan_name=request.body.plan_name;
  var plan_price=request.body.plan_price;

  var sql="insert into plan (plan_name,plan_price) values(?,?)"
  var values=[plan_name,plan_price]
  sql=mysql.format(sql,values)
  con.query(sql,(err)=>{
    if (err) throw err;
    else
    response.render('add_new_plans',{msg:'Plan Added  Succesfully',aid:request.session.admin})
     })
})
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//add_new_plans
app.get('/view_all_plans',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}
  var sql2="select * from plan";
  sql2=mysql.format(sql2)
  con.query(sql2,(err,result)=>{
   if (err) throw err;
   else
   response.render('view_all_plans',{data:result,aid:request.session.admin})
})
})
//-----------------------------------------------------------------------
//add_new_account
app.get('/add_new_account',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}
  var sql2="select * from plan";
  sql2=mysql.format(sql2)
  con.query(sql2,(err,plan_result)=>{
   if (err) throw err;
   else
   {
     var sql2="select * from customers";
     sql2=mysql.format(sql2)
     con.query(sql2,(err,customer_result)=>{
      if (err) throw err;
      else
      response.render('add_new_account',{plan_result:plan_result,customer_result:customer_result,aid:request.session.admin})
   })

   }
})
})
//---------------------------------------------------------------------------
//add_new_account_form
app.post('/add_new_account_form',(request,response)=>{
  var customer_name=request.body.customer_name;
  var domain_name=request.body.domain_name;
  var plan_price=request.body.plan_price;
  var domain_taken=request.body.domain_taken;
  var time_period=request.body.time_period;
  var registerd_date=request.body.registerd_date;
  var expiry_date=request.body.expiry_date;
  var domain_charges=request.body.domain_charges;
  var hosting_charges=request.body.hosting_charges;
  var total_charges=request.body.total_charges;

  var sql="insert into accounts (customer_name ,plan_price ,domain_name ,domain_taken ,time_period ,registerd_date ,expiry_date ,domain_charges ,hosting_charges ,total_charges)  values(?,?,?,?,?,?,?,?,?,?)"
  var values=[customer_name ,plan_price ,domain_name ,domain_taken ,time_period ,registerd_date ,expiry_date , domain_charges ,hosting_charges ,total_charges]
  sql=mysql.format(sql,values)
  con.query(sql,(err)=>{
    if (err) throw err;
    else{
      var sql2="select * from plan";
      sql2=mysql.format(sql2)
      con.query(sql2,(err,plan_result)=>{
       if (err) throw err;
       else
       {
         var sql2="select * from customers";
         sql2=mysql.format(sql2)
         con.query(sql2,(err,customer_result)=>{
          if (err) throw err;
          else
          response.render('add_new_account',{msg:'New Account Added  Succesfully',plan_result:plan_result,customer_result:customer_result,aid:request.session.admin})
       })

     }//else
    })

  }//else
     })
})
//---------------------------------------------------------------------
//view_all_account
app.get('/view_all_account',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}
  var sql2="select * from accounts";
  sql2=mysql.format(sql2)
  con.query(sql2,(err,result)=>{
   if (err) throw err;
   else
   response.render('view_all_account',{data:result,aid:request.session.admin})
})
})
//--------------------------------------------------------------------
//--------------------------------------------------------------------
///delete_account
app.get("/delete_account",(request,response)=>{
  name=request.query.name;
    var sql2="delete from accounts where customer_name=?";
    var values=[name]
    sql2=mysql.format(sql2,values)
    con.query(sql2,(err,result)=>{
     if (err) throw err;
     else{
       var sql2="select * from accounts";
       sql2=mysql.format(sql2)
       con.query(sql2,(err,cresult)=>{
        if (err) throw err;
        else
        response.render('view_all_account',{data:cresult,aid:request.session.admin})

     })
     }

  })
})
//---------------------------------------------------------------------
//customer_login_form
app.post('/customer_login_form',(request,response)=>{
        var cemail=request.body.customer_email;
        var password=request.body.password;
        var sql="select * from customers where email=? and password=?"
        var values=[cemail,password]
        sql=mysql.format(sql,values)
        con.query(sql,(err,result)=>{
          if (err) throw err;
          else if(result.length>0)
          {
          request.session.customer=cemail;
          var sql2="select * from customers  where email=?";
          var values=[cemail];
          sql2=mysql.format(sql2,values)
          con.query(sql2,(err,cresult)=>{
           if (err) throw err;
           else
          {
            var sql2="select * from customers  where email=?";
            var values=[cemail];
            sql2=mysql.format(sql2,values)
            con.query(sql2,(err,result)=>{
             if (err) throw err;
             else{
                var cname=(result[0].name);
               var sql2="select * from accounts  where customer_name=?";
               var values=[cname];
               sql2=mysql.format(sql2,values)
               con.query(sql2,(err,acc_result)=>{
                if (err) throw err;
                else
                  // console.log(acc_result);
                response.render('customerhome',{data:cresult,accounts_data:acc_result,cid:request.session.customer,msg:"Customer Login Success"});
               })
             }
            })


          }
          })
          }


          else
          response.render('home',{err:'login Fail,Try again'})
           })
})
//---------------------------------------------------------------------
//-------------------------------------------------------------------------
//-------------------- Jquery function--------------
app.get('/search_in_accounts',(request,response)=>{
  var name=request.query.name;
  var search_by=request.query.search_by;
  console.log(name);
  console.log(search_by);

  var sql2="select * from accounts where customer_name=?";
  value=[name]
  sql2=mysql.format(sql2,value)
  con.query(sql2,(err,result)=>{
    console.log("Ajax is on"+result);
   if (err) throw err;
   else
   response.json({data:result,aid:request.session.admin})
})
})
//-------------------------------------------------------------------------
//find_customer_by_email
app.get('/find_customer_by_email',(request,response)=>{
  var email=request.query.email;


  var sql2="select * from customers where email=?";
  value=[email]
  sql2=mysql.format(sql2,value)
  con.query(sql2,(err,result)=>{
    console.log("Ajax is on"+result);
   if (err) throw err;
   else
   response.json({data:result})
})
})
//---------------------------------------------------------------------------
//######################################################################
//view_transiction_history
app.get('/view_transiction_history',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}
response.render('view_transiction_history',)
})
//-------------------------------------------------------------------
//forgetpassword_admin
app.get('/forgetpassword_admin',(request,response)=>{
response.render('forgetpassword_admin',)
})
//------------
//forgetpassword_admin_form
app.post('/forgetpassword_admin_form',(request,response)=>{
  aemail=request.body.email;
  var sql="select * from admin where emailid=?"
  var values=[aemail]
  sql=mysql.format(sql,values)
  con.query(sql,(err,result)=>{
    var password=result[0].password;
    if (err) throw err;
    else
    {
      console.log(password);
      var mailOptions = {
        from: 'nodedevelopertestingemail@gmail.com',
        to: aemail,
        subject: 'Password Genration for CMS',
        text: 'Hello '+aemail+" , your Registration for CMS server Management is successfully completed please login with your registerd email and  your passwword is "+password+"  .Thank you..!!!"
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error)
        {
          console.log(error);
        } else
        {
          response.render('forgetpassword_admin',{msg:'Password sent to your Registered Email ID'})

        }
      });
    }
     })
})

//---------------------------------------------------------------------
///show_transiction
app.post('/show_transiction',(request,response)=>{
  var from=request.body.from.split("-").reverse().join("-");
  var to=request.body.to.split("-").reverse().join("-");
  // console.log(from);
  // console.log(to);
    var sql2="select * from accounts where expiry_date between ? and ?";
  value=[to,from]
  sql2=mysql.format(sql2,value)
  con.query(sql2,(err,result)=>{
    var total=[];
    for(var i=0;i<=result.length-1;i++)
     {
      total.push(parseInt(result[i].total_charges));
     }
    var t=total.reduce((a, b) => a + b, 0)
    console.log(t);
   if (err) throw err;
   else{

     response.render(('view_transiction_history'),{data:result,aid:request.session.admin,Total:t})

   }
})

})
//---------------------------------------------------------------------
//update_customer
app.post('/update_customer',(request,response)=>{
  var cname=request.body.cname;
  var cemail=request.body.cemail;
  var mobile=request.body.mobile;
  var password=request.body.password;
  // console.log(cname+cemail+mobile+password);
  var sql="update customers set name=?,password=?,mobile=? where email=?;"
  var values=[cname,password,mobile,cemail]
  sql=mysql.format(sql,values)
  con.query(sql,(err,result)=>{
    // console.log(result.affectedRows);
   if (err) throw err;
   else if(result.affectedRows>0)
   {
     var sql2="select * from customers";
     sql2=mysql.format(sql2)
     con.query(sql2,(err,cresult)=>{
      if (err) throw err;
      else
      response.render('view_all_customers',{data:cresult,aid:request.session.admin,msg:"Details Updated"})

   })
   }
   else
   {
     var sql2="select * from customers";
     sql2=mysql.format(sql2)
     con.query(sql2,(err,result)=>{
      if (err) throw err;
      else
      response.render('view_all_customers',{data:result,aid:request.session.admin,msg:"Details not Updated"})
   })
   }

})
})
//---------------------------------------------------------------------
//update_customer_password
app.get('/update_customer_password',(request,response)=>{
  var new_password=request.query.new_password;
   var email=request.query.email;
//
// console.log(new_password);
// console.log(email);
  var sql="update customers set password=? where email=?;"
  var values=[new_password,email]
  sql=mysql.format(sql,values)
  con.query(sql,(err,result)=>{
  // console.log(result.affectedRows);
   if (err) throw err;
   else
   {
     response.json({msg:"Details Updated"})
   }

})
})
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//admin_logout
app.get('/admin_logout',(request,response)=>{
  if(request.session.admin==0){response.render('adminlogin')}
request.session.destroy();
response.render('adminlogin',{msg:'Admin Logout successfully'})
})
//---------------------------------------------------------------------
//customer_logout
app.get('/customer_logout',(request,response)=>{
  if(request.session.customer==0){response.render('home')}
request.session.destroy();
response.render('home',{msg:'Customer Logout successfully'})
})
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
//---------------------------------------------------------------------
app.post('/api/login',(req,res)=>{
  //Mock user
  const user={
    username:'admin',
    email:'admin@gmail.com'
  }
  jwt.sign({user:user},'abcd',{expiresIn:'60s'},(err,token)=>{
    if (err) throw err;
    res.json({token:token})

  })
})
//-------------
function verifyToken(req,res,next) {
const bearerHeader = req.headers['authorization'];
if(typeof bearerHeader !== 'undefined'){
  const bearer=bearerHeader.split(' ');
  const bearerToken=bearer[1];
  console.log(bearerToken);

  req.token=bearerToken;
  next();
}
else {
  res.json({msg:"Please Provide valid Token"})
}
}
//--------------
app.post('/api/post',verifyToken,(req,res)=>{

  jwt.verify(req.token,'abcd',(err,authData)=>{
    if (err) throw err;
    else
    res.json({msg:"Post created",user:authData})

  })
})
//---------------------------------------------------------------------
//
