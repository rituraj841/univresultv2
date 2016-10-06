var mongoose = require( 'mongoose' );
var User = mongoose.model( 'User' );
var mModel = mongoose.model('marksModel');


exports.loginFormHandler = function (req, res){
	res.render('login.handlebars', {});
};//loginPageHandler

exports.authHandler = function (req, res){
	var nmReq = req.body.nm;
	var pwdReq = req.body.pwd;
	var loginOutcome;

	mongoose.model('User').findOne({username:nmReq}, function(err, userObj){
	    if(userObj === null){
	     	loginOutcome = "Login Failed: Username does not exist.";
        console.log( "Login Name %s, Password %s. Login outcome [%s]", nmReq, pwdReq, loginOutcome);
	     	res.render('login.handlebars', {LoginMessage:loginOutcome});
	    } else {  //userObj is Not NULL
	    	if(pwdReq === userObj.password) {
	    		loginOutcome = "Login successful";
          req.session.authenticated = true;        
          req.session.loggedinUser = nmReq;
          console.log( "Login Name %s, Password %s. Login outcome [%s]", nmReq, pwdReq, loginOutcome);

          if(nmReq === "admin"){
            req.session.rollInSession = 'NA';            
            req.session.isAdmin = true;
          }else{
            req.session.rollInSession = userObj.rollnumber;            
            req.session.isAdmin = false;
          }
          res.render('landingpage.handlebars',
            {welcomeMessage:loginOutcome,
            AUTHENTICATED:req.session.authenticated,
            IS_ADMIN:req.session.isAdmin,
            LOGGED_USER_NAME: req.session.loggedinUser
          });

				} else{
				  loginOutcome = "Login Failed: Password did not match.";
          console.log( "Login Name %s, Password %s. Login outcome [%s]", nmReq, pwdReq, loginOutcome);
          res.render('login.handlebars', {LoginMessage:loginOutcome});
		    }
		  }//userObj is Not NULL

	});//findOne
}; //authHandler

exports.logoutHandler = function (req, res){
  req.session.destroy();
  res.render('login.handlebars', {LoginMessage:"You have successfully logged out."});
};//loginPageHandler

exports.registerFormHandler = function(req, res){
   res.render("register.handlebars", {});
}; //registerFormHandler

exports.registerUserHandler = function(req, res){
   var usernameReq = req.body.username;
   var rollnumberReq = req.body.rollnumber;
   var emailReq = req.body.email;
   var passwordReq = req.body.password;
   var newuser = new User();
   newuser.username = usernameReq;
   newuser.rollnumber = rollnumberReq;   
   newuser.email = emailReq;
   newuser.password = passwordReq;

   //save to db through model
   newuser.save(function(err, savedUser){
       if(err){
         var message = "A user already exists with that username or email";
         console.log(message);
         res.render("register", {errorMessage:message});
         return;
       }else{
         req.session.newuser = savedUser.username;
         res.render('landingpage.handlebars', {welcomeMessage:"Registration succesful"});
       }
   });
};//registerUserHandler


exports.resultFormHandler = function(req, res){
   res.render("resultForm.handlebars",
          {IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            USER_ROLL:req.session.rollInSession,
            LOGGED_USER_NAME: req.session.loggedinUser});
}; //registerFormHandler

exports.resultHandler = function(req,res){
  var rollReq = req.body.roll;
  console.log("resultPageHandler Roll" + rollReq);

  mModel.findOne({roll:rollReq}, function(err, mrksRec){
    if (!err && mrksRec != null){

      res.render('resultPage.handlebars',
          {marks:mrksRec,
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            LOGGED_USER_NAME: req.session.loggedinUser});
    }else{
      console.log("roll number not found");
      var message = "<span class='label label-danger'>Record not found. Check Your Roll Number</span>";
      res.render('landingpage.handlebars',
          {welcomeMessage:message,
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            LOGGED_USER_NAME: req.session.loggedinUser});      
    } 

  });
}//resultPageHandler


exports.marksEntryForm = function(req, res){
   res.render("marksEntryForm.handlebars",
          { AUTHENTICATED:req.session.authenticated,
            IS_ADMIN:req.session.isAdmin,
            LOGGED_USER_NAME: req.session.loggedinUser});
}; //marksEntryForm

exports.marksEntry = function(req, res){
   var nameReq = req.body.nm;////req=request
   var rollReq = req.body.roll;
   var physicsReq = req.body.physics;
   var chemistryReq = req.body.chemistry;
   var mathsReq = req.body.maths;
   var computerReq = req.body.computer;

   console.log("name=%s roll=%s",nameReq, rollReq );
   console.log("physics=%s chem=%s maths=%s comp=%s",physicsReq, chemistryReq ,mathsReq ,computerReq );

   var newmarks = new mModel();
   newmarks.xname = nameReq;
   newmarks.roll = rollReq;
   newmarks.physics = physicsReq;
   newmarks.chemistry = chemistryReq;
   newmarks.maths = mathsReq;
   newmarks.computer = computerReq;
   newmarks.totalmarks = parseInt(newmarks.physics)
              + parseInt(newmarks.chemistry)
              + parseInt(newmarks.maths)
              + parseInt(newmarks.computer) ;
   var perc = (newmarks.totalmarks * 100)/400; 
   var div; 
   if (perc >= 60 ){
    div = "1st";
   }else if (perc >= 45){
    div = "2nd";
   }else if (perc >= 30 ){
    div = "3rd";
   }else {
    div ="fail";
   }
  newmarks.division = div;
  console.log(" Marks total=%s", newmarks.totalmarks);
   //save to db through model
   newmarks.save(function(errorx, savedRec){
       if(errorx){
         var message = "A entry already exists with that name or roll";
         console.log(message);
         res.render('landingpage.handlebars',
          {welcomeMessage:"Entry Submission failed",
            AUTHENTICATED:req.session.authenticated,
            IS_ADMIN:req.session.isAdmin,
            LOGGED_USER_NAME: req.session.loggedinUser});
       }else{
         //req.session.newmarks = savedstudentsscorecard.marks;
         res.render('landingpage.handlebars',
          {welcomeMessage:"Entries Submitted succesfully",
            AUTHENTICATED:req.session.authenticated,
            IS_ADMIN:req.session.isAdmin,
            LOGGED_USER_NAME: req.session.loggedinUser});
       }
   });
};//marksEntry


exports.crosslistHandler = function(req,res){
  var marksArray;
  mModel.find({}, function(err, mrksRec){
    if (!err && mrksRec != null){
      console.log(JSON.stringify(mrksRec));
      marksArrray = mrksRec;
      outcomeBoolean = 1;
      res.render('crosslist.handlebars',
          {marks:mrksRec,
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            LOGGED_USER_NAME: req.session.loggedinUser});
    }
  });//find
}

/////////////////////////////ADD/EDIT/DELETE/SAVE CHANGES///////////////////////////////////////////////////

exports.deleteHandler = function(req, res){
  var rollToEdit = req.query.rollnumber; 
  mModel.remove({roll:rollToEdit}, function(err, marksRec){
  if (!err){
    var message = '<span class="label label-success">A record removed successfully</span>';
    res.render('landingpage.handlebars',           
          {welcomeMessage:message,
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            LOGGED_USER_NAME: req.session.loggedinUser});
  } 
}); //mModel.remove
}; //deleteHandler

exports.editPageHandler = function(req, res){
  var rollToEdit = req.query.rollnumber;
  mModel.findOne({roll:rollToEdit}, function(err, marksRec){
  if (!err){
    //console.log("Going to edit -> [" + marksRec.roll + " : " + marksRec.description + "]")  ;
    //var message = '<span class="label label-danger">update failed</span>';
    res.render('editPage.handlebars', {marksRec:marksRec, 
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            LOGGED_USER_NAME: req.session.loggedinUser});
  } 
}); //mModel.findOne
}; //editPageHandler:marksRec

exports.saveChangesHandler = function(req, res){
  var rollRequest = req.body.roll;
  var phySubjRequest = req.body.physics;
  var chemSubjRequest = req.body.chemistry;
  var mathsSubjRequest = req.body.maths;
  var compSubjRequest = req.body.computer;
  //console.log("Saving Edited records : " + rollRequest + " : " + physicsSubjRequest);
  //update rec through model
  mModel.update({roll:rollRequest}, 
                    {$set: { physics: phySubjRequest, chemistry: chemSubjRequest, maths: mathsSubjRequest, computer: compSubjRequest}}, 
                    {multi:false}, function(err, updatedRec){
   if(err){
     var message = '<span class="label label-danger">Update Failed</span>';
     res.render('landingpage.handlebars', {welcomeMessage:message, 
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
              LOGGED_USER_NAME: req.session.loggedinUser});
   }else{
     var message = '<span class="label label-success">Update succesful</span>';
     res.render('landingpage.handlebars', {welcomeMessage:message, 
            IS_ADMIN:req.session.isAdmin,
            AUTHENTICATED:req.session.authenticated,
            LOGGED_USER_NAME: req.session.loggedinUser});
   }
  });
}; //saveChangesHandler
