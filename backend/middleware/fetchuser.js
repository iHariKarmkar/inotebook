const jwt = require("jsonwebtoken");
const JWT_SECRET = "thisIsthebestreactcourese@by#codewithharry";


const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add a req object

    const token = req.header("auth-token");
    if(!token){
        res.status(401).send({error: "Please authorise with a valid token"})
    }

    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authorise with a valid token" });
        
    }

    
}

module.exports = fetchuser;