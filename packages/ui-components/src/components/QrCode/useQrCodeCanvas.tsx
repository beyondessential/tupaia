import React from 'react'
import { toDataURL } from 'qrcode';

const CODE_SIZE = 300; // width/height at browser display size
const CANVAS_SIZE = 395; // width/height at browser display size
const DOWNLOAD_IMAGE_SCALE = 2; // render the canvas at double size to get a larger and clearer image download
const SCALED_CODE_SIZE = CODE_SIZE * DOWNLOAD_IMAGE_SCALE;
const SCALED_CANVAS_SIZE = CANVAS_SIZE * DOWNLOAD_IMAGE_SCALE;

export const getCanvasUrlForDownload = async (humanReadableId: string, qrCodeContents: string) => {

    // const canvas = document.createElement('canvas')
    // canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
    // canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);

    // const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    // if(!ctx) {
    //   return null
    // }
    // // Background
    // ctx.fillStyle = 'white';
    // ctx.fillRect(0, 0, SCALED_CANVAS_SIZE, SCALED_CANVAS_SIZE);

    // // Add header text
    // const textY = 60 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
    // ctx.fillStyle = 'black';
    // ctx.font = `${24 * DOWNLOAD_IMAGE_SCALE}px sans-serif`;
    // ctx.textAlign = 'center';
    // ctx.fillText(humanReadableId, SCALED_CANVAS_SIZE / 2, textY);

    // // Add qr code
    // // @ts-ignore
    // const qrDataUrl = await toDataURL(qrCodeContents, {
    //   width: SCALED_CODE_SIZE,
    //   height: SCALED_CODE_SIZE,
    // });
    // const img = new Image();
    // const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
    // const codeY = 65 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
    // // img.onload = () => {
    // //   ctx.drawImage(img, codeX, codeY)

    // // };
    // // @ts-ignore
    // img.src = qrDataUrl;
    // await img.decode();
    // console.log('image ln47', img)
    // ctx.drawImage(img, codeX, codeY)

    const canvas: HTMLCanvasElement | null = await createQrCodeCanvas(humanReadableId, qrCodeContents)
    if(!canvas) {
      return
    }
    const url = canvas.toDataURL('image/jpeg', 1.0);
    console.log('url in nested function',url)
    return url
}

export const drawQrCodeCanvas = async (ref: React.MutableRefObject<HTMLCanvasElement | null>, humanReadableId: string, qrCodeContents: string) => {
    if(!ref) {
      return null
    }

    const canvas = ref.current;

    if(!canvas) {
      return null
    }
    canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
    canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if(!ctx) {
      return null
    }
    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, SCALED_CANVAS_SIZE, SCALED_CANVAS_SIZE);

    // Add header text
    const textY = 60 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
    ctx.fillStyle = 'black';
    ctx.font = `${39 * DOWNLOAD_IMAGE_SCALE}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(humanReadableId, SCALED_CANVAS_SIZE / 2, textY);

    // Add qr code
    // @ts-ignore
    const qrDataUrl = await toDataURL(qrCodeContents, {
      width: SCALED_CODE_SIZE,
      height: SCALED_CODE_SIZE,
    });
    const img = new Image();
    const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
    const codeY = 65 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
    
    // @ts-ignore
    img.src = qrDataUrl;
    await img.decode();
    ctx.drawImage(img, codeX, codeY)

  };

  // export const createQrCodeCanvases = async (ref: React.MutableRefObject<HTMLCanvasElement[] | null>, imagesData: {name: string | undefined, value: string | undefined}[]) => {

  //   if(!ref) {
  //     return null
  //   }

  //   const qrDataUrls = await createDataUrls(imagesData)
  //   console.log('data urls',qrDataUrls)

  //   await Promise.all(imagesData.map(async ({name: humanReadableId },index) => {
  //     const newCanvas = document.createElement('canvas')
  //     if(!ref.current) {
  //       return
  //     }
  //     ref.current = [...ref.current, newCanvas]
  //     const canvas = ref.current[index]
  //     canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
  //     canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);
  
  //     const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
  //     if(!ctx) {
  //       return null
  //     }
  //     // Background
  //     ctx.fillStyle = 'white';
  //     ctx.fillRect(0, 0, SCALED_CANVAS_SIZE, SCALED_CANVAS_SIZE);
  
  //     // Add header text
  //     const textY = 60 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
  //     ctx.fillStyle = 'black';
  //     ctx.font = `${24 * DOWNLOAD_IMAGE_SCALE}px sans-serif`;
  //     ctx.textAlign = 'center';

  //     if(!humanReadableId){
  //       return
  //     }
  //     ctx.fillText(humanReadableId, SCALED_CANVAS_SIZE / 2, textY);

  //     const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
  //     const codeY = 65 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
  //     const img = new Image(codeX, codeY)

  //     img.onload = () => {
  //       console.log('drawing image')
  //       console.log('img source onloading',img.src)
  //       ctx.drawImage(img, codeX, codeY)
  //       ctx.save()
  //     };

  //     // @ts-ignore
  //     // img.src = qrDataUrls[index];
  //     img.src = qrDataUrls[index]
  //     console.log('img source',img.src)
  //   }))
    
  // };

  // const createDataUrls = async (imagesData: {name: string | undefined, value: string | undefined}[]) => {

  //     const qrDataUrls = await Promise.all(imagesData.map(async({ value }) => {
        
  //       // @ts-ignore
  //       return toDataURL(value, {
  //         width: SCALED_CODE_SIZE,
  //         height: SCALED_CODE_SIZE,
  //       });
  //     }))

  //     return qrDataUrls;
    
  // }

  const createQrCodeCanvas = async (humanReadableId: string, qrCodeContents: string) => {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', `${SCALED_CANVAS_SIZE}`);
    canvas.setAttribute('height', `${SCALED_CANVAS_SIZE}`);

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if(!ctx) {
      return null
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, SCALED_CANVAS_SIZE, SCALED_CANVAS_SIZE);

    const textY = 60 * DOWNLOAD_IMAGE_SCALE; // Make sure to avoid the QR code "quiet zone"
    ctx.fillStyle = 'black';
    ctx.font = `${24 * DOWNLOAD_IMAGE_SCALE}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(humanReadableId, SCALED_CANVAS_SIZE / 2, textY);

    // @ts-ignore
    const qrDataUrl = await toDataURL(qrCodeContents, {
      width: SCALED_CODE_SIZE,
      height: SCALED_CODE_SIZE,
    });
    const img = new Image();
    const codeX = (SCALED_CANVAS_SIZE - SCALED_CODE_SIZE) / 2;
    const codeY = 65 * DOWNLOAD_IMAGE_SCALE;
    // @ts-ignore
    img.src = qrDataUrl;
    await img.decode();
    console.log('image ln47', img)
    ctx.drawImage(img, codeX, codeY)
    return canvas
  }