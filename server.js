const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const bodyParser = require('body-parser');
const fs = require('fs');
const { put } = require('@vercel/blob');
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
app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.image;
    const date = new Date();
    const imagename = `${date.getDate()}${date.getTime()}_${file.name}`;
    

    try {
        // Upload the file to Vercel Blob
        const token = "vercel_blob_rw_j20NfDpwhZDExEyV_wboCdgI7KYE19TiybG0wKMzdNoLiPd";
        const { url } = await put(imagename, file.data, {
            access: 'public',  // Make the file publicly accessible
            contentType: file.mimetype,
            token
        });

        // Fetch the image data from Vercel Blob
        const imageResponse = await fetch(url);
        const imageBuffer = await imageResponse.arrayBuffer(); 
        
        // Set the response header to the appropriate MIME type 
        res.set('Content-Type', file.mimetype); 
        // Send the image data 
        res.send (Buffer.from(imageBuffer));

    } catch (err) {
        console.error('Error uploading to Vercel Blob:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/health-check', (req, res) => {
    res.status(200).json({ message: 'Backend is ready' });
});


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