var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
});

const connection = mongoose.connection;

connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})


app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const Schema = mongoose.Schema;
const exSchema = new Schema({
  username: String,
  log:Array
})
const TRACK = mongoose.model("TRACK", exSchema);


app.post('/api/exercise/new-user', async function (req, res) {

  const userName = req.body.username
  
 
  // check if the url is valid or not
 
  
  
  if (userName==null  || userName.length==0) {
    res.json({error:'username required'})
  } else {
    try {
      // check if its already in the database
      let findOne = await TRACK.findOne({
        username: userName
      })
      if (findOne) {
        res.json({
          username: findOne.username,
          _id:findOne._id
          
        })
      } else {
        // if its not exist yet then create new one and response with the result
        findOne = new TRACK({
          username: userName
          
        })
        await findOne.save()
        res.json({  username: findOne.username,
          _id:findOne._id
        })
      }
    } catch (err) {
      console.error(err)
      res.status(500).json('Server erorr...')
    }
  }
})

app.get('/api/exercise/users', async function(req,res){
  try{
     let findAll=await TRACK.find()
     let arry=[]
     for(let i=0;i<findAll.length;i++ ){
       
            arry.push({username:findAll[i].username, _id:findAll[i]._id})
     }
     if(findAll){
     //  console.log(findAll.username)
        res.json(arry)
     }
    else{
      res.json({error:'Records not found'})
    }
  }catch(err){
    console.error(err)
    res.status(500).json('Server error...')
  }
})

app.post('/api/exercise/add',async function(req,res){
  const {userId,description,duration}=req.body
  let date=req.body.date
  
  date = (date ==="" || date==null )?new Date().toDateString():new Date(req.body.date).toDateString();
  
  
  
  if (userId==null  || userId.length==0) {
    res.json({error:'userId required'})
  }
  else if(description==null || description.length==0){
    res.json({error:'description required'})
  }
  else if(duration==null || duration.length==0){
    res.json({error:'duration required'})
  }
  else {
    
    try{
      let findOne = await TRACK.findById({_id: userId })
      //console.log(findOne,'gguy')
      if (findOne) {
        let data={description:description,duration:parseInt(duration),date:date}
        findOne.log.push(data)
        await findOne.save()
        let dat1={username: findOne.username,description:description,duration:parseInt(duration),_id:findOne._id,date:date}
        res.json(dat1)
       }
      
      else{
          //console.log(findOne,"llkkl")
        res.json({error:'No Record found'})
      }
    }
    catch(err){
      console.err(err)
      res.status(500).json('Server error')
      
    }
  }
  
  
  //res.json({userId,description,duration,date})
})

app.get('/api/exercise/log', async function(req,res){
  let userId=req.query.userId
   let queries = {
    from: req.query.from,
    to: req.query.to,
    limit: req.query.limit
  };
  try{
    
    
     let findbyid=await TRACK.findById({_id: userId })
    
     if(findbyid){
     //  console.log(findAll.username)
        let newLog = findbyid.log;
      
     
       if (req.query.from ){
      newLog = newLog.filter( x => new Date(x.date)> new Date(req.query.from) );}
    if (req.query.to)
      newLog = newLog.filter( x => new Date(x.date) < new Date(req.query.to));
    if (req.query.limit)
      newLog = newLog.slice(0, req.query.limit > newLog.length ? newLog.length : req.query.limit);
    //user.log = newLog;
        res.json({
          _id:findbyid._id,
          username: findbyid.username,
          log:newLog,
          count:newLog.length
        })
     }
    else{
      res.json({error:'Records not found'})
    }
  }catch(err){
    console.error(err)
    res.status(500).json('Server error...')
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
