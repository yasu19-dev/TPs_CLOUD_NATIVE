const express=require('express')
const jwt=require('jsonwebtoken')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
/*********************************route get  */
app.get('/api',(req,res)=>{

  res.json({

      'msg':'Hello Fullstack'
  })

})

/***********Route Post :********************/
let secret='fullstack'
app.post('/api/login', (req, res) => {
          //1-recupérer les parametres :
               // const {id,username, password } = req.body

                 /*ou bien */

        let id=req.body.id
        let username=req.body.username
        let password=req.body.password

         //2- Vérifier que les informations de connexion sont valides
        if (id==1 && username === 'yasmine' && password === '123456') {
          const user = { id: id, username: 'cloud_natif' }

          //3- Créer un jeton JWT signé
         // const token = jwt.sign({ user }, secret, { expiresIn: '2m' })
          const token = jwt.sign({ user }, secret)
          res.json({ token })
        } else {
          res.json({ message: 'user or pass invalid !!!' })
        }
})
      
    /***********************Route créer post  */
    app.post('/api/posts',verifytoken, (req, res) => {
      jwt.verify(req.token,secret,(err,data)=>{
        if(err){
            res.sendStatus(403)          
        }
        
        res.json({
            'msg':'post created' ,
            data   
            })
      })
    })

    /*********function verifytoken ***********/
    function verifytoken(req,res,next){

        // format of token  : Authorization:bearer token

        const bearerHeader=req.headers['authorization']

        if(typeof bearerHeader !=='undifinded')
        {
            // split to extract token
            const token = bearerHeader.split(' ')[1]
            // set token 
            req.token=token
            next()
        }else{
            res.sendStatus(403)           
        }    

    }

app.listen('8000', ()=> console. log('server started on port 8000'))