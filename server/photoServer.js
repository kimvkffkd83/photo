const express =  require("express");
const cors =  require("cors");
const bodyParser =  require("body-parser");
const multer =  require("multer");
const path =  require("path");
const {randomUUID}=  require("crypto");
const fs =  require("fs");

const app = express();
const port = 5000;
const limit = 10000000; //10메가바이트

app.use(cors());
app.use(bodyParser.urlencoded({ limit: limit, extended:false, parameterLimit:limit}));
// app.use(bodyParser.text({type: '/'}));
app.use(bodyParser.json({limit: limit}));
//정적 파일 위치 설정
app.use(express.static(path.join(path.resolve(), 'public','img','uploads')));

const upload = multer({
    //저장소 설정 -> 디스크에 할 지 메모리에 할 지 선택 가능
    storage: multer.diskStorage({
        //저장할 위치
        destination(req,file,callback){
            const allowed = ['notice', 'note', 'protection'];
            if(allowed.includes(req.params.route)){
                const dir = `public/img/uploads/${req.params.route}`;
                ! fs.existsSync(dir) && fs.mkdirSync(dir);
                callback(null,dir);
            }else{
                callback(null,'public/img/uploads/caution');
            }
        },
        //파일 명명 규칙
        filename(req, file, callback){
            file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
            const ext = path.extname(file.originalname);
            callback(null, path.basename(file.originalname,ext) + randomUUID() + ext);
        }
    }),
    // 파일 크기 제한 설정
    limits : {
        files:10, fileSize: limit
    }
}).array('img')

app.listen(port, ()=>{
    console.log("포토 서버 개시 완료")
})

app.post('/img/:route', (req,res) =>{
    upload(req, res, function (err) {
        if (err) {
            console.log(`사진 업로드 중 에러 : ${err}`);
            res.status(500).send(`사진을 불러올 수 없습니다. 관리자에게 문의하세요.`);
            return;
        }

        if(req.files === undefined || req.files.length <= 0){
            res.status(404).send(`이미지 파일이 입력되지 않았습니다. 관리자에게 문의하세요.`);
            return;
        }

        console.log("저장할 위치",req.params.route);
        console.log('전달받은 파일', req.files);

        // 파일이 저장된 경로를 클라이언트에게 반환해준다.
        let totalUrls = [];
        req.files.map((file,idx)=>{
            const IMG_URL = `http://localhost:${port}/${req.params.route}/${file.filename}`;
            console.log(IMG_URL);
            totalUrls.push(IMG_URL);
        })
        res.json({ urls: totalUrls.toString() });
    })
})