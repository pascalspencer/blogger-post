const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
// const admin = require('firebase-admin');
// const serviceAccount = require('./bloggingSiteKey.json'); // Your Firebase service account key

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: 'blogging-site-4e017.appspot.com'
// });

// const bucket = admin.storage().bucket();



let initial_path = path.join(__dirname, "public");

const app = express();
app.use(express.static(initial_path));
app.use(fileupload());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.sendFile(path.join(initial_path, "home.html"));
})

app.post('/editor', (req, res) => {
    const {username, password} = req.body;

    if (username === 'pascal' && password === 'semaje'){
        res.sendFile(path.join(initial_path, "editor.html"));
    }else{
        res.status(401).send("Invalid username or password");
    }
})

app.get('/admin', (req, res) => {
    res.sendFile(path.join(initial_path, "admin.html"));
})

// upload link
app.post('/upload', (req, res) => {
    let file = req.files.image;
    let date = new Date();
    // image name
    let imagename = date.getDate() + date.getTime() + file.name;
    // image upload path
    let path = 'public/uploads/' + imagename;

    // Check if directory exists, and create it if not
    if (!fs.existsSync('public/uploads')) {
        fs.mkdirSync('public/uploads', { recursive: true });
    }

    // create upload
    file.mv(path, (err, result) => {
        if(err){
            throw err;
        } else{
            // our image upload path
            res.json(`uploads/${imagename}`)
        }
    })
})

app.listen(3000, () => {
    console.log('Server running on port 3000...');
});

app.get("/:blog", (req, res) => {
    res.sendFile(path.join(initial_path, "blog.html"));
})

app.use((req, res) => {
    res.json("404");
})

app.listen("3000", () => {
    console.log('listening......');
})
module.exports = app;