const firebase = require("./../config/firebase");

exports.signup = ( async (req, res) => {
    console.log(req.body)
    if(!req.body.email || !req.body.password){
        return res.status(442).json({
            email: "email is required",
            password: "password is required"
        });    
    }
    await firebase
        .auth()
        .createUserWithEmailAndPassword(req.body.email, req.body.password)
        .then((data) => {
            return res.status(201).json(data);
        })
        .catch((e) => {
            let errorCode = e.code;
            let errorMessage = e.message;
            if(errorCode == "auth/weak-password") {
                return res.status(500).json({error: errorMessage});
            } else {
                return res.status(500).json({error: errorMessage});
            }
        })
})

exports.signin = ( async (req,res) => {
    if(!req.body.email || !req.body.password){
        return res.status(442).json({
            email: "email is required",
            password: "password is required"
        });    
    }
    await firebase 
        .auth()
        .signInWithEmailAndPassword(req.body.email, req.body.password)
        .then((user) => {
            return res.status(200).json(user);
        })
        .catch((e) => {
            let errorCode = e.code; 
            let errorMessage = e.message; 
            if (errorCode === "auth/wrong-password") {
                return res.status(500).json({error: errorMessage});
            } else {
                return res.status(500).json({error: errorMessage});
            }
        })
})

