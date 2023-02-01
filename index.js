const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const app = express();
const port = process.env.PORT || 5000;
//middleware
app.use(cors());
app.use(express.json());
//session
const session = require("express-session");
const cookieParser = require('cookie-parser');
const { config } = require('dotenv');

app.use(cookieParser());
app.use(
    session({
        resave: true,
        saveUninitialized: true,
        secret: 'secret'
    })
)
const user = {}


const  sendResePasswordMail=async(name,email,token)=>{
    try{
     const transporter=   nodemailer.createTransport({
            host:"smtp.mailtrap.io",
            posrt :465,
            secure:true,
            requireTLS:true,
            auth:{
                user:process.env.email,
                pass:process.env.pass

            }
        });




        console.log(process.env.email,process.env.pass)
        const mailOptions={
            from: process.env.email,
            to:email,
            subject:"for reset password",
           // http://localhost:5000/forgetpass
            // html:'<p>hi '+name+',</p> please copy this link  <a herf="http://localhost:5000/forgetpass?token='+token+'">  and reset your password </a>'
            html:"<p>ali</p>"
        }



         transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Mail has been sent ",info.response)
            }
         }
         )
       await transporter.sendMail({
        from:process.env.email,
        to: email,
        subject:'adlf',
        text:"hi petar"
       })




    }
    catch(error){
    //   return  res.status(400).send({success:false,msg:error.message});
    console.log(error);
    }

    


}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lopokh6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });






async function run() {
    try {
        const userCollection = client.db('tecBlog').collection('Users');

        app.get('/user', async (req, res) => {
            // const query = {};
            // const users = await userCollection.find(query).toArray();
            if(!req.session.user){
                return res.status(422).send({ error: 'You have to login to see this api' });
            }
            res.send(`(${req.session.user?.Username}) is login now`);

        })
        app.post('/registration', async (req, res) => {
            const { Username, Email, Password } = req.body;
            if (!Username || !Email || !Password) {
                return res.status(422).json({ error: 'Fild the all details' });
            }
            const isEmailExist = await userCollection.find({ Email: Email }).toArray();
            const isUserNameExist = await userCollection.find({ Username: Username }).toArray();


            if (isEmailExist[0]?.Email === Email) {
                return res.status(422).json({ error: ' Email Already Exist' });
            }
            else if (isUserNameExist[0]?.Username === Username) {
                return res.status(422).json({ error: 'Username Already Exist' });
            }
            const result = await userCollection.insertOne(req.body);
          res.status(201).send("User Created");
        })

        app.post('/login', async (req, res) => {
            const { Password, Username} = req.body;

            if (!Username || !Password) {
                return res.status(422).json({ error: 'Fild the all details' });
            }
            const isvalid = await userCollection.findOne({ Username: Username, Password: Password });
            if (!isvalid) {
                return res.status(422).json({ error: 'Please input valid password and Username...' });
            }
            req.session.user = isvalid;
            req.session.save();
            res.send("User Login");

        })
        app.get("/logout", (req, res) => {
            req.session.destroy();
            return res.send("User logged out....");
        });

        app.put("/forgetpass",async(req ,res)=>{
     
             const email = req.body.Email;
             console.log(email);
            try{
             const userData =  await userCollection.findOne({Email:email});
           console.log(userData)
             if(userData){
                const randomString = randomstring.generate();
              const data = await  userCollection.updateOne({Email:email},{$set:{token:randomString}})

              sendResePasswordMail(userData.Username,userData.Email,randomString);
              res.status(200).send({success:true,msg:"Please check your inbox of mail and reset your passwoard"})
             }
             else{
                res.status(200).send({success:true,msg:"This email does not exists"})
             }
            }
            catch(error){
                res.status(400).send({success:false,msg:error.message})
            }
        })


    }
    finally {

    }
}
run().catch(err => console.log(err));






app.get('/', async (req, res) => {
    res.send('Hello , Piter');
})

app.listen(port, () => console.log('Hello , Piter'));