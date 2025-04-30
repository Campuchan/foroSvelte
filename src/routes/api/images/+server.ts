import { json } from '@sveltejs/kit';
import { log } from 'console';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import path from 'path';

export const POST = async ({ request }) => {

  const formData = await request.formData();
  const nombreArchivo : string = formData.get('nombreArchivo') as string; // nombre con el que se guardara la imagen
  const file = formData.get('image');
  const tipo = formData.get('tipo'); 

  if (!(file instanceof File)) {
    return json({ error: 'No llego imagen' }, { status: 400 });
  }

  const tamanoMaximo = 8 * 1024 * 1024; // 8MB

  if (file.size > tamanoMaximo) {
    return json({ error: 'La imagen es demasiado grande, tamaño maximo 8MB' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let sharpBuffer = await sharp(buffer)
    .jpeg({ quality: 80 })
    .toBuffer();
  
  if(tipo === 'perfil') {
    // 200x200px
    sharpBuffer = await sharp(sharpBuffer)
      // cover recorta por los lados
      // https://sharp.pixelplumbing.com/api-resize/
      .resize(200, 200, { fit: 'cover' })
      .toBuffer();
  }

  // static/images
  const dirImagenes = path.join(process.cwd(), 'static', 'images');
  await fs.mkdir(dirImagenes, { recursive: true });
  // las imagenes se guardan con el nombre del usuario y jpg
  const nombreArchivoFinal = `${nombreArchivo}.jpg`;
  const pathFinal = path.join(dirImagenes, nombreArchivoFinal);
  log('Guardando imagen en: ', pathFinal);

  await fs.writeFile(pathFinal, sharpBuffer);

  return json({ message: 'Imagen guardada', filename: nombreArchivoFinal });
};