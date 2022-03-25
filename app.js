const express = require('express')

const app = express()

const passport = require('passport')

const session = require('express-session')
const User = require('./models/User')

const facebookStrategy = require('passport-facebook').Strategy

app.set("view engine","ejs")

app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));

app.use(passport.initialize());

app.use(passport.session()); 

passport.use(new facebookStrategy({


    clientID        : "379427817425179",
    clientSecret    : "bdf39ed5139c391c06a7116d8cd49a79",
    callbackURL     : "http://localhost:5000/facebook/callback",
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']

},
function(token, refreshToken, profile, done) {

  
    process.nextTick(function() {

  
        User.findOne({ 'uid' : profile.id }, function(err, user) {


            if (err)
                return done(err);

          
            if (user) {
                console.log("user found")
                console.log(user)
                return done(null, user); 
            } else {
             
                var newUser            = new User();

             
                newUser.uid    = profile.id;         
                newUser.token = token; 
                newUser.name  = profile.name.givenName + ' ' + profile.name.familyName;
                newUser.email = profile.emails[0].value;
                newUser.gender = profile.gender
                newUser.pic = profile.photos[0].value
            
                newUser.save(function(err) {
                    if (err)
                        throw err;

                 
                    return done(null, newUser);
                });
            }

        });

    })

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.user)
    res.render('profile', {
        user : req.user 
    });
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


function isLoggedIn(req, res, next) {


	if (req.isAuthenticated())
		return next();


	res.redirect('/');
}

app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

app.get('/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

app.get('/',(req,res) => {
    res.render("index")
})

app.listen(5000,() => {
    console.log("Testing")
})