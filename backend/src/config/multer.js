import multer from 'multer';
//bb de tranformação de nome para
import crypto from 'crypto';
//função para retornar a extenção do arquivo
//percorrer o caminho na app
import { extname, resolve } from 'path';

export default {
  //como o multer vai guardar o arquivo de img
  //existe varias formas de armazenas (CDN / e na propria app)
  storage: multer.diskStorage({
    //destino dos arquivos 
    destination: resolve(__dirname, '..', '..', 'tmp', 'upload'),
    //como será formatado o nome do arquivo
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        //u12udsuad.png

        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};