var express=require("express");
var app=express();
const path=require("path")
var fileuploader=require("express-fileupload");
const cloudinary = require("cloudinary").v2;
var sql=require("mysql2")
const bcrypt = require("bcrypt");
cloudinary.config({ 
  cloud_name: 'dlrwcm7ji',
  api_key: '232223482439149',
  api_secret: 'KSo_NNQJOZ3iNoDmGl3ZCt1Pk0k'
});
app.use(express.json()); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBuxWsyRQS6s8JLsWvRGLX8x9Y8xRb0IAA");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function AIFUNCTION(imgurl)
{
const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', Name:'', gender:'', dob: ''}. Dont give output as string."   
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
            
            const cleaned = result.response.text().replace(/json|/g, '').trim();
            const jsonData = JSON.parse(cleaned);
            console.log(jsonData);

    return jsonData;
}

let url="mysql://avnadmin:AVNS_HNssljGh6VTSpIEvMxO@mysql-e263de3-nitj-c81f.e.aivencloud.com:16666/defaultdb?ssl-mode=REQUIRED"
let MYSQ=sql.createConnection(url)
MYSQ.connect(function(err){
    if(!err){
        console.log("Connected");
    }
    else{
        console.log(err.message)
    }
})
app.use(fileuploader())
app.listen(2006,function() {
    console.log("Hello World");
    console.log(__dirname)
    // console.log(filename)
})

app.get("/",function (req,resp) {
       resp.sendFile(__dirname+"/public/index.html");
})

app.get("/signup",function(req,resp){
    resp.sendFile(__dirname+"/public/Signup.html")
})
app.use(express.urlencoded({ extended: true }));
app.post("/submit-process", async function(req,resp){

    const hashedPassword = await bcrypt.hash(req.body.Password,10);

    MYSQ.query(
        "insert into credentials values(?,?,?,?,?)",
        [req.body.Username,req.body.Email,hashedPassword,req.body.UserT,1],
        function(err){
            if(!err){
                resp.send("Updated Successfully");
            }
            else{
                resp.send(err.message);
            }
        }
    );
});

app.get("/volunteercred",function (req,resp) {
    resp.sendFile(__dirname + "/public/Volunteer.html");
})
app.post("/login-process", function(req, resp){
console.log(req.body)
  MYSQ.query(
    "SELECT * FROM credentials where emailid = ?",
    [req.body.Email],
    async function(err, result){

      if (err) {
        resp.send(err.message);
        return;
      }

      if (result.length === 1) {

        const match = await bcrypt.compare(req.body.Password, result[0].password);

        if(match){

            if(result[0].status==1){
                resp.send(result[0].usertype);
            }
            else{
                resp.send("Account Blocked");
            }

        } else {
            resp.send("Invalid Email or Password");
        }

      }
      else {
        resp.send("Invalid Email or Password");
      }
    }
  );
});

app.get("/voldash",function (req,resp) {
    resp.sendFile(__dirname + "/public/VolDash.html");
})
app.post("/submitcred",async function(req,resp){
  let Email=req.body.Email;
  let Name=req.body.name;
  let contact=req.body.contact;
  let address=req.body.Address;
  let city=req.body.city;
  let gender=req.body.gen;
  let occu=req.body.occu;
  let adhar=req.files.adhar;
  let prof=req.files.profile;
  let adharname="";
  let profname="";

  if(req.files!=null)
        {

            
            if(adhar)
            {
                adharname =  adhar.name;

                let fullPath = __dirname + "/upload/" + adharname;

                adhar.mv(fullPath);

                await cloudinary.uploader.upload(fullPath).then(function(result)
                {
                    adharname = result.url;

                    console.log("Profile uploaded:", adharname);
                });
            }

            if(prof)
            {
                profname = prof.name;

                let fullPath = __dirname + "/upload/" + profname;

                prof.mv(fullPath);

                await cloudinary.uploader.upload(fullPath).then(function(result)
                {
                    profname = result.url;

                    console.log("Aadhaar uploaded:", profname);
                });
            }

        }
        MYSQ.query("insert into Volprofile values(?,?,?,?,?,?,?,?,?)",[Email,Name,contact,address,city,gender,occu,adharname,profname],function(err,resarr){
        if (!err) {
          resp.send("Submitted Successfully");
        } else {
          resp.send(err.message);
        }
        })  
})

app.post("/updatecred",async function(req,resp){
  let Email=req.body.Email;
  let Name=req.body.name;
  let contact=req.body.contact;
  let address=req.body.Address;
  let city=req.body.city;
  let gender=req.body.gen;
  let occu=req.body.occu;
  let adhar=req.files.adhar;
  let prof=req.files.profile;
  let adharname="";
  let profname="";
  MYSQ.query("select * from Volprofile where emailid=?",[Email],async function(err,resarr){
    if(resarr.length==1){
        adharname=resarr[0].adharurl;
        profname=resarr[0].picurl;
        console.log(adharname);
        console.log(profname);
    }
  })

  if(req.files!=null)
        {

            if(adhar)
            {
                adharname =  adhar.name;

                let fullPath = __dirname + "/upload/" + adharname;

                adhar.mv(fullPath);

                await cloudinary.uploader.upload(fullPath).then(function(result)
                {
                    adharname = result.url;

                    console.log("Profile uploaded:", adharname);
                });
            }

            if(prof)
            {
                profname = prof.name;

                let fullPath = __dirname + "/upload/" + profname;

                prof.mv(fullPath);

                await cloudinary.uploader.upload(fullPath).then(function(result)
                {
                    profname = result.url;

                    console.log("Aadhaar uploaded:", profname);
                });
            }
        }
        MYSQ.query("update Volprofile set name=?,contact=?,address=?,city=?,gender=?,occupation=?,adharurl=?,picurl=? where emailid=?",[Name,contact,address,city,gender,occu,adharname,profname,Email],function(err,resarr){
        if (!err) {
          resp.send("Updated Successfully");
        } else {
          resp.send(err.message);
        }
        })  
})
app.get("/Beggarcred",function(req,resp){
    resp.sendFile(__dirname+"/public/Beggar.html")
})
app.post("/begsubmit-process", async function(req, resp) {

    let aiJsonData = {};

    let Email = req.body.email;
    let Name = aiJsonData.name;
    let Age = aiJsonData.age;
    let Gender = aiJsonData.gen;
    let Address = req.body.address;
    let City = req.body.city;
    let type = JSON.stringify(req.body.type || []);
    let contact = req.body.contact;
    let IDProof = req.body.idproof;
    let proofno = aiJsonData.proofno;

    let proofurl = req.files?.proof;
    let selfurl = req.files?.self;

    let proofname = "";
    let selfname = "";

    try {

        if (req.files != null) {

           
            if (proofurl) {
                proofname = proofurl.name;

                let full_path = __dirname + "/upload/" + proofname;
                await proofurl.mv(full_path);

                try {
                    await cloudinary.uploader.upload(full_path).then(async function(result) {

                        proofname = result.url;
                        console.log("Proof Uploaded:", proofname);

                    
                        aiJsonData = await AIFUNCTION(result.url);

                        console.log("AI DATA:", aiJsonData);

                    
                        Name = aiJsonData.name || Name;
                        Gender = aiJsonData.gender || Gender;
                        proofno = aiJsonData.adhaar_number || proofno;

                        if (aiJsonData.dob) {
                            const birthYear = new Date(aiJsonData.dob).getFullYear();
                            const currentYear = new Date().getFullYear();
                            Age = currentYear - birthYear;
                        }
                    });
                } catch (err) {
                    console.log("Cloudinary/AIFunction Error:", err.message);
                }
            }

            if (selfurl) {
                selfname = selfurl.name;

                let full1_path = __dirname + "/upload/" + selfname;
                await selfurl.mv(full1_path);

                try {
                    await cloudinary.uploader.upload(full1_path).then(function(result) {
                        selfname = result.url;
                        console.log("Self Uploaded:", selfname);
                    });
                } catch (err) {
                    console.log("Self Upload Error:", err.message);
                }
            }
        }

        MYSQ.query(
            "insert into Begprofile values(?,?,?,?,?,?,?,?,?,?,?,?)",
            [Email, Name, Age, Gender, Address, City, type, contact, IDProof, proofno, proofname, selfname],
            function(err) {
                if (!err) {
                    resp.sendFile(__dirname + "/public/index.html");
                } else {
                    resp.send(err.message);
                }
            }
        );

    } catch (err) {
        console.log(err);
    }
});
app.post("/begupdate-process",async function(req,resp){
    let Email=req.body.email;
    let Name=aiJsonData.name;
    let Age=aiJsonData.age;
    let Gender=aiJsonData.gen;
    let Address=req.body.address;
    let City=req.body.city;
    let type=JSON.stringify(req.body.type||[]);
    let contact=req.body.contact;
    let IDProof=req.body.idproof;
    let proofno=aiJsonData.proofno;
    let proofurl=req.files.proof;
    let selfurl=req.files.self;
    let proofname="";
    let selfname="";
    MYSQ.query("select * from Begprofile where emailid=?",[Email],function(err,resarr){
        if(resarr.length==1){
            proofname=resarr[0].proofurl;
            selfname=resarr[0].selfurl
        }
    })
    if(req.files){
        if(proofurl){
             proofname=proofurl.name;
            let full_path=__dirname+"/upload/"+proofname;
            await proofurl.mv(full_path);
            await cloudinary.uploader.upload(full_path).then(function(result){
                proofname=result.url;
            })
        }
        if(selfurl){
            selfname=selfurl.name;
            let full1_path=__dirname+"/upload/"+selfname;
            await selfurl.mv(full1_path);
            await cloudinary.uploader.upload(full1_path).then(function(result){
                selfname=result.url;
            })
        }
    }
    MYSQ.query("update Begprofile set name=?,age=?,gender=?,address=?,city=?,type=?,contact=?,idproof=?,proofno=?,proofurl=?,selfurl=? where emailid=?",[Name,Age,Gender,Address,City,type,contact,IDProof,proofno,proofname,selfname,Email], async function(err,resarr){
        if(!err){
            resp.send("Values Saved");
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/voldash",function(req,resp){
    resp.sendFile(__dirname+"/public/VolDash.html");
})

app.get("/chngpass", async function (req,resp) {

    MYSQ.query(
        "select * from credentials where emailid=?",
        [req.query.Email],
        async function(err,resarr){

        if(err){
            resp.send(err.message);
            return;
        }

        if(resarr.length==1){

            const match = await bcrypt.compare(
                req.query.oldpass,
                resarr[0].password
            );

            if(match){

                const newHash = await bcrypt.hash(req.query.newpass,10);

                MYSQ.query(
                    "update credentials set password=? where emailid=?",
                    [newHash,req.query.Email],
                    function(err){
                        if(!err){
                            resp.send("Updated Successfully");
                        }else{
                            resp.send(err.message);
                        }
                    }
                );

            }
            else{
                resp.send("Wrong Credentials");
            }

        }
        else{
            resp.send("Invalid Id or Password");
        }

    });

});
app.get("/admindash",function(req,resp){
    resp.sendFile(__dirname+"/public/Admin.html")
})
app.get("/allvol",function(req,resp){
    resp.sendFile(__dirname+"/public/All-Volunteers.html")
})
app.get("/allbeg",function(req,resp){
    resp.sendFile(__dirname+"/public/All-Beggars.html")
})
app.get("/allusers",function(req,resp){
    resp.sendFile(__dirname+"/public/All-users.html");
})
app.get("/angularfetchall",function(req,resp){
    MYSQ.query("select * from credentials",function(err,jsontable){
        if(!err){
            resp.send(jsontable);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/fetchvol",function(req,resp){
    MYSQ.query("select * from Volprofile",function(err,jsonarr){
        if(!err){
            resp.send(jsonarr);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.get("/fetchbeg",function(req,resp){
    MYSQ.query("select * from Begprofile",function(err,jsonarr){
        if(!err){
            resp.send(jsonarr);
        }
        else{
            resp.send(err.message);
        }
    })
})

app.post("/onblock",function(req,resp){
    let Email=req.body.Email;
    console.log(Email)
    MYSQ.query("update credentials set status=? where emailid=?",[0,Email],function(err,jsonarr){
        if(!err){
            console.log(jsonarr.affectedRows)
            resp.send(jsonarr)
        }
        else{
            resp.send(err.message)
        }
    })
})

app.post("/onresume",function(req,resp){
    console.log(req.body)
    let Email=req.body.Email;
    MYSQ.query("update credentials set status=? where emailid=?",[1,Email],function(err,jsonarr){
        if(!err){
            resp.send(jsonarr)
        }
        else{
            resp.send(err.message)
        }
    })
})

app.get("/Citizen-Profile",async function (req,resp) {
    let Email=req.query.Email;
    let Mob=req.query.Mob;
    let Name=req.query.Name;
    let Adharno=req.query.Adharno;
    let Fathername=req.query.Fathername;
    let dob=req.query.dob;
    let gen=req.query.gen;
    let add=req.query.Address;
    let city=req.query.city;
    let froadhar=req.files.froadhar;
    let backadhar=req.files.backadhar;
    let froadharname="";
    let backadharname="";
    if(req.files){
        if(froadhar){
             froadharname=froadhar.name;
            let full_path=__dirname+"/upload/"+proofname;
            await froadharname.mv(full_path);
            await cloudinary.uploader.upload(full_path).then(function(result){
                froadharname=result.url;
            })
        }
        if(backadhar){
            backadharname=backadhar.name;
            let full1_path=__dirname+"/upload/"+backadharname;
            await backadharname.mv(full1_path);
            await cloudinary.uploader.upload(full1_path).then(function(result){
                backadharname=result.url;
            })
        }
    }
    MYSQ.query("insert into ")
})
//----------------------- Find worker ------------------------------
app.get("/find",function(req,resp){
  let fullpath=__dirname+"/public/find.html";
  resp.sendFile(fullpath);
})

app.get("/angularfetchwork",function(req,resp){
  MYSQ.query("select distinct type from Begprofile ",function(err,tableInJsonArray)
  {
    resp.send(tableInJsonArray);
  })
})

app.get("/angularfetchcity",function(req,resp){
  MYSQ.query("select distinct city from Begprofile",function(err,tableInJsonArray)
  {
    resp.send(tableInJsonArray);
  })
})

app.get("/fetchworker", function(req, resp){

  let work = req.query.type;
  let city = req.query.city;

  let query = "SELECT * FROM Begprofile WHERE type=? AND city=?";

  MYSQ.query(query, [work, city], function(err, result) {
    if (err) {
      resp.send(err);
    } else {
      resp.send(result);
    }
  });
});

app.get("/angularfetchBaggers",function(req,resp){
  MysqlCon.query("select * from baggers",function(err,tableInJsonArray)
  {
    resp.send(tableInJsonArray);

  })
})