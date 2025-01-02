import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')  //cb means callback.
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export  const upload = multer({ storage: storage })



/*
This code defines a function that determines the destination directory for uploaded files using the Multer middleware. When a file is uploaded, this function is called with the request object (`req`), the file being uploaded (`file`), and a callback function (`cb`). The callback function is then called with `null` as the first argument (indicating no error) and the path `../public/temp` as the second argument, specifying the directory where the file should be stored.
*/