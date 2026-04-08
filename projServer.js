var express= require("express");
var app= express();

app.use(express.static("public"));

var fileuploader= require("express-fileupload");
app.use(fileuploader());// File Uploader-------------

const bcrypt = require("bcrypt");   // PASSWORD SECURITY---------

var mysql= require("mysql2");

var cloudinary=require("cloudinary").v2;
 cloudinary.config({ 
            cloud_name: 'duil8nsbo', 
            api_key: '817223246631413', 
            api_secret: 'nC9514VjF7BQMgVhBmGwy0QmcfQ' // Click 'View API Keys' above to copy your API secret
        });

let Url="mysql://avnadmin:AVNS_Oat9ro_IM8jybV3bAbl@mysql-3368b55a-guptaudit887-5857.j.aivencloud.com:27722/defaultdb"
let MysqlCon= mysql.createConnection(Url);
    MysqlCon.connect(function(err)
    {
        if(err==null)
            console.log("sql connected");
        else   
            console.log("sql not connected");    
    })

let portNo=2026;

//--------------------------AI----------------------------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");

                                        //add ur key
const genAI = new GoogleGenerativeAI("AIzaSyAW8ojmMVgwq69bKeGcRlzcB3mga_-eVP8");


const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.listen(portNo,function()
    {
        console.log("hello");
    })

app.get("/",function(req,resp)
    {
        // resp.send("helo");
        // resp.send(__dirname + "<br>" + __filename);

        let fullPath= __dirname + "/public/index.html";
        resp.sendFile(fullPath);
    })


//--------------------------------index data saved--------------------------------

app.get("/recordTable", async function(req,resp)
    {
        let email=req.query.txtEmail;
        let pwd=req.query.txtPwd;
        let utype=req.query.txtUtype;
        // let dos=req.query.txtDos;

        const secPwd= await bcrypt.hash(pwd,10);

        MysqlCon.query("insert into USERS values(?,?,?,current_date(),1)",[email,secPwd,utype],function(callBackerr)
        {
            if(callBackerr==null)
                resp.send("record is saved");

            else
                resp.send(callBackerr.message)
        })

    })


app.use(express.urlencoded(true));  // JRURI HI HAI BS---------------

//-------------Checking Utype in login-------------

app.get("/checkUtype",async function(req,resp)
    {
        // console.log("udit");
        let email=req.query.txtEmailL;
        let pwd=req.query.txtPwdL;

        // console.log(req.body); 
        // console.log("email:",email); 
        // console.log("pwd:",pwd);

        MysqlCon.query("select * from USERS where txtEmail=?",[email],async function(err,tableinJasonArray)
        {
            if(err)
                resp.send("sever error")

            if(tableinJasonArray.length==0)
                resp.send("invalid id or pass")

            if(tableinJasonArray[0].txtStatus == 0)
                resp.send(" ACCOUNT BLOCKED");


            const match= await bcrypt.compare(pwd,tableinJasonArray[0].txtPwd);

            if(match)
                resp.send(tableinJasonArray[0].txtUtype);

            else
                resp.send("Wrong Password");
        })
    })

//---------------volantier login page------------------

app.get("/voluntier-login", function (req,resp)
    {
        let fullPath=__dirname+"/public/profileVol.html";
        resp.sendFile(fullPath);
        
    })

app.post("/voluntier-login", async function(req,resp)
    {
        let jsonObjStr=JSON.stringify(req.body);
        console.log(req.body);

        let fileAdhar="NO_PIC.jpg";

        if(req.files!=null)
        {
            fileAdhar=req.files.fileAdhar.name;
            let fullPath=__dirname+"/uploads/"+fileAdhar;
            req.files.fileAdhar.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
                {
                    fileAdhar=picUrlResult.url;
                    console.log("adharpicUploaded:",fileAdhar);
                })
        }

        let filePic="NO_PIC.jpg";

        if(req.files!=null)
        {
            filePic=req.files.filePic.name;
            let fullPath=__dirname+"/uploads/"+filePic;
            req.files.filePic.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
                {
                    filePic=picUrlResult.url;
                    console.log("profileUploaded:",filePic);
                })
        }


        let email=req.body.volEmail;
        let name=req.body.volName;
        let number=req.body.volNumber;
        let address=req.body.volAddress;
        let city=req.body.volCity;
        let gender=req.body.volGender;
        let occu=req.body.volOccu;
        let adhar=fileAdhar;
        let profile=filePic;
        let type=req.body.volType;
        let regNo=req.body.volNgoNo;

        MysqlCon.query("insert into volProfile values(?,?,?,?,?,?,?,?,?,?,?)",[email,name,number,address,city,gender,occu,adhar,profile,type,regNo],function(callBackerr)
        {
            if(callBackerr == null)
                    resp.send("vol recored is saved");
            else
                resp.send(callBackerr.message)
        })

    })
//----------------------update volProfile----------------------------

app.post("/doUpdate",async function(req,resp)
    {
        console.log(req.body);
        let fileAdhar;
        let filePic;

        if(req.files != null)
        {
            fileAdhar=req.files.fileAdhar.name;
            let fullPath=__dirname+"/uploads/"+fileAdhar;
            req.files.fileAdhar.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
            {
                fileAdhar=picUrlResult.url;
                console.log("adharpicUploaded:",fileAdhar);
            })
        }
        // else
            // fileAdhar=req.body.hdn;


        if(req.files != null)
        {
            filePic=req.files.filePic.name;
            let fullPath=__dirname+"/uploads/"+filePic;
            req.files.filePic.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
            {
                filePic=picUrlResult.url;
                console.log("profileUploaded:",filePic);
            })
        }

        let email=req.body.volEmail;
        let name=req.body.volName;
        let number=req.body.volNumber;
        let address=req.body.volAddress;
        let city=req.body.volCity;
        let gender=req.body.volGender;
        let occu=req.body.volOccu;
        let adhar=fileAdhar;
        let profile=filePic;
        let type=req.body.volType;
        let regNo=req.body.volNgoNo;

        MysqlCon.query("update volProfile set volName=?, volNumber=?, volAddress=?, volCity=?, volGender=?, volOccu=?,volAdhar=?, volProfilePic=?, volType=?, volNgoNo=? where volEmail=?",[name,number,address,city,gender,occu,adhar,profile,type,regNo,email],function(callBackerr)
        {
            if(callBackerr == null)
                    resp.send("vol record Updated");

            else
                resp.send(callBackerr.message);
        })
    })

//------------------Fething data from volProfile-------------------------

app.get("/fetchData",function(req,resp)
    {
        let email=req.query.volEmail;
        MysqlCon.query("select * from volProfile where volEmail=?",[email],function(err,tableinJasonArray)
        {
            if(tableinJasonArray.length==1)
                resp.send(tableinJasonArray);

            else
                resp.send("wrong email entered")
        })
    })

//---------------------Citizens Insert--------------------------
app.get("/citizen-details", function (req,resp)
    {
        let fullPath=__dirname+"/public/profileCitizen.html";
        resp.sendFile(fullPath);
        
    })

app.post("/citizen-profile", async function(req,resp)
    {
        let jsonObjStr=JSON.stringify(req.body);
        console.log(req.body);

        let fileFront="NO_PIC.jpg";

        if(req.files!=null)
        {
            fileFront=req.files.fileAdharFront.name;
            let fullPath=__dirname+"/uploads/"+fileFront;
            req.files.fileAdharFront.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
                {
                    fileFront=picUrlResult.url;
                    console.log("Front pic uploaded:",fileFront);
                })
        }

        let fileBack="NO_PIC.jpg";

        if(req.files!=null)
        {
            fileBack=req.files.fileAdharBack.name;
            let fullPath=__dirname+"/uploads/"+fileBack;
            req.files.fileAdharBack.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
                {
                    fileBack=picUrlResult.url;
                    console.log("Back pic uploaded:",fileBack);
                })
        }


        let email=req.body.citizenEmail;
        let number=req.body.citizenNo;
        let name=req.body.citizenName;
        let adharNo=req.body.citizenAdharNo;
        let fatherName=req.body.citizenFather;
        let dob=req.body.citizenDob;
        let gender=req.body.citizenGender;
        let address=req.body.citizenAddress;
        let city=req.body.citizenCity;
        
    
        let front=fileFront;
        let back=fileBack;

        MysqlCon.query("insert into citizenProfile values(?,?,?,?,?,?,?,?,?,?,?)",[front,back,email,number,name,adharNo,fatherName,dob,gender,address,city],function(callBackerr)
        {
            if(callBackerr == null)
                    resp.send("citizen recored is saved");
            else
                resp.send(callBackerr.message)
        })
    })
//------------------------------------------Begger Details page------------------------------------------

app.get("/Bagger-Details",function(req,resp)
    {
        let fullPath=__dirname+"/public/detailsBegger.html";
        resp.sendFile(fullPath);
    })

app.post("/Bagger-Details", async function(req,resp)
    {
        let jsonObjStr=JSON.stringify(req.body);
        console.log(req.body);

        let fileProof="NO_PIC.jpg";
        let  aiJsonData;            //------------AI----------------

        if(req.files!=null)
        {
            fileProof=req.files.baggFileProof.name;
            let fullPath=__dirname+"/uploads/"+fileProof;
            req.files.baggFileProof.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(async function(picUrlResult)
                {
                    fileProof=picUrlResult.url;
                    console.log("Proof pic uploaded:",fileProof);
                    aiJsonData=await aiHelper(picUrlResult.url);
                })
        }

        let filePic="NO_PIC.jpg";

        if(req.files!=null)
        {
            filePic=req.files.baggFilePic.name;
            let fullPath=__dirname+"/uploads/"+filePic;
            req.files.baggFilePic.mv(fullPath);

            await cloudinary.uploader.upload(fullPath).then(function(picUrlResult)
                {
                    filePic=picUrlResult.url;
                    console.log("bagger pic uploaded:",filePic);
                })
        }


        let email=req.body.volRefId;
        let address=req.body.baggAddress;
        let city=req.body.baggCity;
        let work=req.body.baggWork;
        let number=req.body.baggNumber;
        // let proof=req.body.baggProof;        //not needed
        
        let proofPic=fileProof;
        let pic=filePic;
        //---------------------------gettig by AI----------------------------------
        let name=aiJsonData.name;
        let dob=aiJsonData.dob;
        let gender=aiJsonData.gender;
        let proofNo=aiJsonData.adhaar_number;


        MysqlCon.query("insert into baggers values(?,?,?,?,?,?,?,?,?,?,?)",[email,name,dob,gender,address,city,work,number,proofNo,proofPic,pic],function(callBackerr)
        {
            if(callBackerr == null)
                    resp.send("vol recored is saved");
            else
                resp.send(callBackerr.message)
        })
    })
//--------------------------------------------------------------------------------------------------------------------
async function aiHelper(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string."   
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())
            
            const cleaned = result.response.text().replace(/```json|```/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData

}

app.post("/picreader", async function (req, resp) {
    let fileName;
    if (req.files != null) 
        {
       //const myprompt = "Read the text on picture and tell all the information";
        //  const myprompt = "Read the text on picture in JSON format";
        fileName = req.files.baggFileProof.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path
        
        req.files.baggFileProof.mv(locationToSave);//saving file in uploads folder
        
        //saving ur file/pic on cloudinary server
        try{
        await cloudinary.uploader.upload(locationToSave).then(async function (picUrlResult) {
           
            //sending pic to Gemini for reading
            let jsonData=await aiHelper( picUrlResult.url);
            
            //use information from json for saving inside insert quiery
            resp.send(jsonData);

        });

        //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
        // resp.send(respp);
        // console.log(typeof(respp));
        }
        catch(err)
        {
            resp.send(err.message)
        }

    }
})


//----------------------------------------Find Worker---------------------------------------------    
app.get("/findWorkers",function(req,resp)
    {
        let fullPath=__dirname+"/public/find-worker.html";
        resp.sendFile(fullPath);
    })


//----------------------------------------angular workers fetch-------------------------------------
app.get("/getWorkerTypes",function(req,resp)
{
    MysqlCon.query("select distinct baggWork from baggers",function(err,tableinJasonArray)
    {
        resp.send(tableinJasonArray);
    })
})

app.get("/getCity",function(req,resp)
{
    MysqlCon.query("select distinct baggCity from baggers",function(err,tableinJasonArray)
    {
        resp.send(tableinJasonArray);
    })
})

app.get("/fetchWorkers",function(req,resp)
    {
        let work=req.query.baggWork;
        let city=req.query.baggCity;

        MysqlCon.query("select * from baggers where baggWork=? and baggCity=?",[work,city],function(err,result)
        {
            // console.log(result);
            resp.send(result);
        })


    })

 //--------------------------------------Volantier DashBoard--------------------------------------------------

 app.get("/volDash",function(req,resp)
    {
        let fullPath=__dirname+"/public/dash-vol-ngo.html";
        resp.sendFile(fullPath);
    })



//--------------------------------------setting modal in vol dashBoard------------------------------
app.get("/updatePass",function(req,resp)
    {
        let email=req.query.settingEml;
        let oldPass=req.query.oldPwd;
        let newPass=req.query.newPwd;

        MysqlCon.query("select * from USERS where txtEmail=? and txtPwd=?",[email,oldPass],function(err,result)
        {
            if(err)
                resp.send(err.message);

            else if(result.length==0)
                resp.send("invail mail or pass");

            else
            {
                MysqlCon.query("update USERS set txtPwd=? where txtEmail=?",[newPass,email],function(callBackerr)
                  {
                    if(callBackerr==null)
                        resp.send("vol pass updated")
                    else
                        resp.send(callBackerr.message);
                    })    
            }
        })
        

    })

//--------------------------------------citizen dash--------------------------------------------
 app.get("/citizenDash",function(req,resp)     
    {
        let fullPath=__dirname+"/public/citizen-Dash.html";
        resp.sendFile(fullPath);
    })

//-------------------------------------setting modal in citizen dashBoard---------------------
app.get("/updateCitizenPass",function(req,resp)
    {
        let email=req.query.settingEml;
        let oldPass=req.query.oldPwd;
        let newPass=req.query.newPwd;

        MysqlCon.query("select * from USERS where txtEmail=? and txtPwd=?",[email,oldPass],function(err,result)
        {
            if(err)
                resp.send(err.message);

            else if(result.length==0)
                resp.send("invail mail or pass");

            else
            {
                MysqlCon.query("update USERS set txtPwd=? where txtEmail=?",[newPass,email],function(callBackerr)
                  {
                    if(callBackerr==null)
                        resp.send("vol pass updated")
                    else
                        resp.send(callBackerr.message);
                    })    
            }
        })
        

    })

//----------------------------------------------ADMIN DASHBOARD------------------------------------
app.get("/adminDash",function(req,resp)
    {
        let fullPath=__dirname+"/public/admin-Dash.html";
        resp.sendFile(fullPath);
    })

app.get("/UsersManager",function(req,resp)
    {
        let fullPath=__dirname+"/public/all-Users.html";
        resp.sendFile(fullPath);
    })


app.get("/volantier",function(req,resp)
    {
        let fullPath=__dirname+"/public/all-Volantier.html";
        resp.sendFile(fullPath);
    })

app.get("/citizens",function(req,resp)
    {
        let fullPath=__dirname+"/public/all-Citizens.html";
        resp.sendFile(fullPath);
    })

app.get("/beggers",function(req,resp)
    {
        let fullPath=__dirname+"/public/all-Beggers.html";
        resp.sendFile(fullPath);
    })

//-----------------------------------------------ANGUlar-------------------------------------------

app.get("/angular-fetchUsers",function(req,resp)
   {
        MysqlCon.query("select * from USERS",function(err,tableInJsonArray)
            {
                resp.send(tableInJsonArray);
            })
    })

app.get("/angular-userBlock",function(req,resp)
    {
        let email=req.query.txtEmail;

        MysqlCon.query("update USERS set txtStatus=0 where txtEmail=?",[email],function(callBackerr)
        {
            if(callBackerr==null)
                resp.send("blocked");

            else
                resp.send(callBackerr.message)
        })
    })

app.get("/angular-userResume",function(req,resp)
    {
        let email=req.query.txtEmail;

        MysqlCon.query("update USERS set txtStatus=1 where txtEmail=?",[email],function(callBackerr)
        {
            if(callBackerr==null)
                resp.send("resumed");

            else
                resp.send(callBackerr.message)
        })
    })

app.get("/angular-fetchBeggers",function(req,resp)
   {
        MysqlCon.query("select * from baggers",function(err,tableInJsonArray)
            {
                resp.send(tableInJsonArray);
            })
    })

app.get("/angular-fetchVolantiers",function(req,resp)
   {
        MysqlCon.query("select * from volProfile",function(err,tableInJsonArray)
            {
                resp.send(tableInJsonArray);
            })
    })


    app.get("/angular-fetchCitizens",function(req,resp)
   {
        MysqlCon.query("select * from citizenProfile",function(err,tableInJsonArray)
            {
                resp.send(tableInJsonArray);
            })
    })