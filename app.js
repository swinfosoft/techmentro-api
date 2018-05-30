//express is imported
var express=require('express');
//express app is created
var app=express();
//path module of the node is imported.
var path=require('path');
//cors middleware is imported
var cors=require('cors');
//mongoose is imported
const mongoose = require('mongoose');

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

//connection is created
mongoose.connect(mongoURL);
//const con=mongoose.connection;



const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname+'/public/uploads')
    },
    filename: (req, file, cb) => {
       var filename=file.originalname;
       var ext=filename.substr(filename.indexOf('.'));
       var newName=Date.now()+ext;
       cb(null, newName);
      
    }
});
const upload = multer({ storage: storage });

//A mongoose Model objects are created

const job = mongoose.model('jobs', 
{ 
 title: String, description: String,
 package: String, experience: String,
 skills: Array, location:String,
 replyTo:String, postDate:String, 
 status:String, postedBy:String,
 
});

const application = mongoose.model('applications', 
{ 
 applicant: String, job: String,
 status: String, appliedOn: String,
 actions: Array
});

const user = mongoose.model('users', 
{ 
 type: String, name: String,
 mobile:String, mailId: String,
 password: String,  profileImage : String,
 resume:String, 
});

app.use('/',express.static(__dirname));

//body parser middleware is imported
var bodyParser = require('body-parser');
// middleware to process application/json
app.use(bodyParser.json());

//cors middleware is registered
app.use(cors());

app.get('/',(req,res)=>{

	res.sendStatus(200);
});

app.get('/pagecount',(req,res)=>{

	res.sendStatus(200);
});

app.post('/upload', upload.any(), (req, res,next) => {
            
        var url='public/uploads/'+req.files[0].filename;
        res.json({'code':1,'message':"success",'data':{'url':url}});
               
           
        });
 
app.put('/user/update',(req,res)=>{

    var obj = new user(req.body);
        obj.save().then(()=>
                    { 
							res.json({'code':1,'message':"success"});
					});

});


//to save a user to the db
app.post('/register',(req,res)=>{
    var obj = new user(req.body);
        obj.save().then(()=>
                    { 
							res.json({'code':1,'message':"success"});
					});
    
        });
        

//to login a user to the db
app.post('/login',(req,res)=>{
	
    user.find(req.body).then((docs)=>{
        if(docs.length > 0)
        {
              res.json({'code':1,'message':'success','data':{ 'authKey':docs[0]._id,'type':docs[0].type}});
             
		}
        else
        {
              res.json({'code':0,'message':'invalid credentials','data':{}});
		}
	})	
});

//method to search a mailId
app.get('/email-exist',function(req,res){
	  user.find(req.query).then((docs)=>{
        if(docs.length > 0)
        {
              res.json({'code':1,'message':"exists"});
              
		}
        else
        {
              res.json({'code':0,'message':"doesn't exists"});
		}
    });
});

//method to delete a user using its id 
app.delete('/user/delete',(req,res)=>{
     user.remove(req.query).then(()=>{
            res.json({'code':1,'message':"deleted"});
    });
    
});
//method to return a user using its id 
app.get('/user/profile',(req,res)=>{
    
    user.findById(req.query._id).then((doc)=>{
        if(doc !=null)
        {
        res.json({'code':1,'profile':doc});
        }
        else
        {
            res.json({'code':0,'profile':''});
        }
    });
    
});

//to post a job
app.post('/job/post',(req,res)=>{
      var obj = new job(req.body);
		obj.save().then(()=>{console.log('saved.');
							res.json({'code':1,'message':"saved"});
						});
    
        });
        
//to update a job
app.post('/job/update',(req,res)=>{
     var obj = new job(req.body);
		obj.save().then(()=>{
							res.json({'code':1,'message':"saved"});
						});
    
		});

        
//to fetch jobs by the given query
app.get('/job',(req,res)=>{
     
    job.find(req.query).then((docs)=>
            {
                if(docs != null && docs.length > 0)
                    res.json({'code':1,'message':'success','data':{'jobs':docs}});
                else
                res.json({'code':0,'message':'failed','data':{}});
	        });
    
        });    
// to delete a job
app.delete('/job/delete',(req,res)=>{
    
    job.remove(req.query).then(()=>{
            res.json({'code':1,'message':"success"});
    });
    
});
//to post an application
app.post('/application',(req,res)=>{
    
    var obj = new application(req.body);
		obj.save().then((job)=>{
                    		res.json({'code':1,'message':"success"});
						});
    
        });
//to update an application
app.post('/application/update',(req,res)=>{
  
    var obj = new application(req.body);
		obj.save().then(()=>{
							res.json({'code':1,'message':"success"});
						});
    
		});
//to fetch applications by the given query
app.get('/application',(req,res)=>{
     
    application.find(req.query).then((docs)=>
            {
                if(docs != null && docs.length > 0)
                    res.json({'code':1,'message':'success','data':{'applications':docs}});
                else
                res.json({'code':0,'message':'failed','data':{}});
	        });
    
        });  
        
 // to delete a job
app.delete('/application/delete',(req,res)=>{
    
    application.remove(req.query).then(()=>{
            res.json({'code':1,'message':"success"});
    });
    
});       


app.on('close',function(){
    console.log('closing connection...');
    mongoose.connection.close();
})

app.listen(port,ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
