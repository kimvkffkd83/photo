const express =  require("express");
const cors =  require("cors");
const bodyParser =  require("body-parser");
const path =  require("path");

const app = express();
const port = 5001;
const limit = 10000000; //10메가바이트

app.use(cors());
app.use(bodyParser.urlencoded({ limit: limit, extended:false, parameterLimit:limit}));
app.use(bodyParser.json({limit: limit}));
app.use(express.static(path.join(path.resolve(), 'public','document')));
app.listen(port, ()=>{
    console.log("파일 서버 개시 완료")
})

app.post('/file',(req,res)=>{
    const {fileName}  = req.body;
    console.log('req.body',req.body);
    console.log('fileName',fileName);
    let fileUrl = '';
    switch (fileName) {
        case 'adoptFormDog' : fileUrl='개-입양설문지.hwp'; break;
        case 'adoptFormCat' : fileUrl='고양이-입양신청서.hwp'; break;
    }
    // 파일이 저장된 경로를 클라이언트에게 반환해준다.
    const IMG_URL = `http://localhost:${port}/${fileUrl}`;
    res.json({ url: IMG_URL });
})