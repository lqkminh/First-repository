/* Export the Mass — tạo PDF/DOCX ngay trên trình duyệt. */
(function(){
"use strict";
const $export = id => document.getElementById(id);
let exportFormat="pdf";
let exportPage="A4";
let exportBusy=false;

function exportEntry(dateKey){return ORDO_DATA[dateKey]||null;}
function exportHasData(entry){
 return !!entry&&exportItems(entry).length>0;
}
function exportTitle(entry){return entry.title_vi||entry.titleVi||entry.title||"Sách lễ";}
function exportLatinTitle(entry){return entry.title_la||entry.titleLatin||"";}
function exportParts(date){
 const parts=dateFormatter.formatToParts(date);
 const weekday=parts.find(p=>p.type==="weekday")?.value||"";
 return {
  weekday,
  weekdayTitle:weekday.charAt(0).toUpperCase()+weekday.slice(1),
  dateText:String(date.getDate()).padStart(2,"0")+"/"+String(date.getMonth()+1).padStart(2,"0")+"/"+date.getFullYear()
 };
}
function exportItems(entry){
 return typeof getOrderedSections==="function"?getOrderedSections(entry):[
  ...(Array.isArray(entry.sections)?entry.sections:[]),
  ...(Array.isArray(entry.readings)?entry.readings:[]),
  ...(Array.isArray(entry.prayers)?entry.prayers:[])
 ];
}
function exportSafeName(value){
 return String(value||"SachLe").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/đ/g,"d").replace(/Đ/g,"D")
  .replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,64)||"SachLe";
}
function exportFilename(dateKey,entry,format,page){
 const suffix=format==="pdf"&&page==="booklet"?"_A5_booklet":"";
 return "SachLe_"+dateKey+suffix+"."+(format==="pdf"?"pdf":"docx");
}
function exportDownload(blob,fileName){
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;a.download=fileName;a.style.display="none";
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function exportText(item,lang,kind){
 return getBilingualField(item,lang,kind)||"—";
}
/*
 * Noto Serif có bộ ký tự Vietnamese và được phát hành theo SIL Open Font License.
 * pdfmake tải TTF qua URL rồi nhúng font vào từng PDF được tạo.
 */
const PDF_SERIF_URL="https://raw.githubusercontent.com/google/fonts/main/ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf";
const PDF_SERIF_ITALIC_URL="https://raw.githubusercontent.com/google/fonts/main/ofl/notoserif/NotoSerif-Italic%5Bwdth%2Cwght%5D.ttf";
let pdfSerifRegistered=false;
function registerEmbeddedPdfFont(){
 if(!window.pdfMake||typeof window.pdfMake.addFonts!=="function")throw new Error("Không tải được pdfmake.");
 if(!pdfSerifRegistered){
  if(typeof window.pdfMake.setUrlResourceCaching==="function")window.pdfMake.setUrlResourceCaching(true);
  window.pdfMake.addFonts({
   NotoSerifEmbedded:{
    normal:PDF_SERIF_URL,
    bold:PDF_SERIF_URL,
    italics:PDF_SERIF_ITALIC_URL,
    bolditalics:PDF_SERIF_ITALIC_URL
   }
  });
  pdfSerifRegistered=true;
 }
}
function pdfCell(item,lang){
 const label=exportText(item,lang,"label");
 const reference=exportText(item,lang,"reference");
 const latinReference=exportText(item,"la","reference");
 const text=exportText(item,lang,"text");
 const showReference=reference&&reference!=="—"&&!(lang==="vi"&&latinReference===reference);
 return {
  stack:[
   {text:label,bold:true,fontSize:10.5,margin:[0,0,0,2]},
   ...(showReference?[{text:reference,fontSize:9,italics:true,margin:[0,0,0,4]}]:[]),
   {text:text||"—",fontSize:11,alignment:"justify",lineHeight:1.32}
  ],
  margin:[8,7,8,9],
  verticalAlignment:"top"
 };
}
function pdfDefinition(entry,date,pageSize){
 const dateInfo=exportParts(date);
 const title=exportTitle(entry);
 const latinTitle=exportLatinTitle(entry);
 const rows=[[
  {text:"LATINH",style:"columnHeader"},
  {text:"TIẾNG VIỆT",style:"columnHeader"}
 ]];
 exportItems(entry).forEach(item=>rows.push([pdfCell(item,"la"),pdfCell(item,"vi")]));
 const margins=pageSize==="A5"?[30,42,30,42]:[42,48,42,44];
 const contentSize=pageSize==="A5"?10.5:11;
 const meta=[entry.rank,entry.color,entry.season].filter(Boolean).join(" · ");
 return {
  pageSize,
  pageOrientation:"portrait",
  pageMargins:margins,
  info:{title:title+" — "+dateInfo.dateText,author:"Ordo Romanus",subject:"Sách lễ song ngữ Latinh — Việt"},
  header:function(){
   return {text:"ORDO ROMANUS · MISSALE ROMANUM 1962",alignment:"center",font:"NotoSerifEmbedded",fontSize:8,color:"#555555",margin:[margins[0],16,margins[2],0]};
  },
  footer:function(pageNumber,pageCount){
   return {
    columns:[
     {text:"Ordo Romanus · "+new Intl.DateTimeFormat("vi-VN").format(new Date()),font:"NotoSerifEmbedded",fontSize:8,color:"#555555"},
     {text:String(pageNumber)+" / "+String(pageCount),alignment:"right",font:"NotoSerifEmbedded",fontSize:8,color:"#555555"}
    ],
    margin:[margins[0],0,margins[2],17]
   };
  },
  content:[
   {text:title+" — "+dateInfo.dateText+", "+dateInfo.weekdayTitle,style:"title"},
   ...(latinTitle?[{text:latinTitle,style:"latinTitle"}]:[]),
   ...(meta?[{text:meta,style:"metadata"}]:[]),
   {
    table:{headerRows:1,widths:["*","*"],body:rows},
    layout:{
     hLineWidth:function(i){return i===1?.55:.25;},
     vLineWidth:function(i){return i===1?.45:0;},
     hLineColor:function(){return "#c9c4b9";},
     vLineColor:function(){return "#c9c4b9";},
     paddingLeft:function(){return 6;},
     paddingRight:function(){return 6;},
     paddingTop:function(){return 5;},
     paddingBottom:function(){return 5;}
    },
    keepWithHeaderRows:1
   },
   ...(entry.demo?[{text:"Dữ liệu minh họa — cần đối chiếu bản văn trước khi sử dụng chính thức.",font:"NotoSerifEmbedded",fontSize:8,italics:true,color:"#666666",margin:[0,10,0,0]}]:[])
  ],
  defaultStyle:{font:"NotoSerifEmbedded",fontSize:contentSize,color:"#222222",lineHeight:1.3},
  styles:{
   title:{font:"NotoSerifEmbedded",fontSize:pageSize==="A5"?14:16,bold:true,alignment:"center",color:"#222222",margin:[0,0,0,5]},
   latinTitle:{font:"NotoSerifEmbedded",fontSize:11,italics:true,alignment:"center",color:"#333333",margin:[0,0,0,7]},
   metadata:{font:"NotoSerifEmbedded",fontSize:9,alignment:"center",color:"#555555",margin:[0,0,0,11]},
   columnHeader:{font:"NotoSerifEmbedded",fontSize:11,bold:true,alignment:"center",color:"#222222",margin:[0,4,0,4]}
  }
 };
}

async function imposeBooklet(a5Blob){
 if(!window.PDFLib||!window.PDFLib.PDFDocument)throw new Error("Không tải được thư viện pdf-lib.");
 const {PDFDocument,rgb}=window.PDFLib;
 const sourceBytes=await a5Blob.arrayBuffer();
 const source=await PDFDocument.load(sourceBytes);
 const sourcePages=source.getPages();
 const actualCount=sourcePages.length;
 if(!actualCount)throw new Error("PDF nguồn không có trang.");
 const paddedCount=Math.ceil(actualCount/4)*4;
 const output=await PDFDocument.create();
 const embeddedPages=await output.embedPdf(sourceBytes);
 const sheetWidth=841.8898;  // A4 ngang, 297 mm.
 const sheetHeight=595.2756; // 210 mm.
 const halfWidth=sheetWidth/2;
 for(let sheet=0;sheet<paddedCount/4;sheet++){
  const front=[paddedCount-1-2*sheet,2*sheet];
  const back=[2*sheet+1,paddedCount-2-2*sheet];
  for(const pair of [front,back]){
   const outputPage=output.addPage([sheetWidth,sheetHeight]);
   pair.forEach((pageIndex,position)=>{
    if(pageIndex>=actualCount)return; // Phần đệm để tổng trang chia hết cho 4.
    const embedded=embeddedPages[pageIndex];
    const original=embedded.size();
    const scale=Math.min(halfWidth/original.width,sheetHeight/original.height);
    const width=original.width*scale,height=original.height*scale;
    const x=position*halfWidth+(halfWidth-width)/2;
    const y=(sheetHeight-height)/2;
    outputPage.drawPage(embedded,{x,y,width,height});
   });
   outputPage.drawLine({
    start:{x:halfWidth,y:10},end:{x:halfWidth,y:sheetHeight-10},
    thickness:.35,color:rgb(.84,.82,.77)
   });
  }
 }
 const bytes=await output.save();
 return new Blob([bytes],{type:"application/pdf"});
}
async function createPdf(entry,date,page){
 registerEmbeddedPdfFont();
 const logicalPage=page==="booklet"?"A5":page;
 const a5orA4=await window.pdfMake.createPdf(pdfDefinition(entry,date,logicalPage)).getBlob();
 return page==="booklet"?await imposeBooklet(a5orA4):a5orA4;
}

function makeWordCell(item,lang,cellWidth,style){
 const d=window.docx;
 const {Paragraph,TextRun,TableCell,AlignmentType,VerticalAlign,WidthType}=d;
 const label=exportText(item,lang,"label");
 const reference=exportText(item,lang,"reference");
 const latinReference=exportText(item,"la","reference");
 const showReference=reference&&reference!=="—"&&!(lang==="vi"&&latinReference===reference);
 const text=exportText(item,lang,"text");
 return new TableCell({
  width:{size:cellWidth,type:WidthType.DXA},
  verticalAlign:VerticalAlign.TOP,
  margins:{top:120,bottom:140,left:style.cellPad,right:style.cellPad},
  children:[
   new Paragraph({
    keepNext:true,spacing:{before:style.before,after:55},
    children:[new TextRun({text:label,bold:true,color:"A32139",font:"Times New Roman",size:style.labelSize,smallCaps:true})]
   }),
   ...(showReference?[new Paragraph({
    keepNext:true,spacing:{after:75},
    children:[new TextRun({text:reference,italics:true,color:"81745F",font:"Times New Roman",size:style.referenceSize})]
   })]:[]),
   new Paragraph({
    alignment:AlignmentType.JUSTIFIED,spacing:{after:style.after,line:style.line},
    children:[new TextRun({text:text||"—",font:"Times New Roman",size:style.bodySize,color:"302C27"})]
   })
  ]
 });
}
async function createDocx(entry,date,page){
 if(!window.docx||!window.docx.Document||!window.docx.Packer)throw new Error("Không tải được thư viện tạo Word (docx). Hãy kiểm tra kết nối Internet.");
 const d=window.docx;
 const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,Header,Footer,AlignmentType,WidthType,BorderStyle,PageNumber}=d;
 const isA5=page==="A5";
 const pageWidth=isA5?8391:11906;
 const pageHeight=isA5?11906:16838;
 const margin=isA5?680:900;
 const contentWidth=pageWidth-2*margin;
 const cellWidth=Math.floor(contentWidth/2);
 const style={
  cellPad:isA5?100:145,before:70,
  after:isA5?105:145,
  line:isA5?275:300,
  labelSize:20,
  referenceSize:18,
  bodySize:isA5?21:22
 };
 const dateInfo=exportParts(date);
 const title=exportTitle(entry);
 const latinTitle=exportLatinTitle(entry);
 const meta=[entry.rank,entry.color,entry.season].filter(Boolean).join(" · ");
 const noBorder={style:BorderStyle.NIL,size:0,color:"FFFFFF"};
 const tableBorders={
  top:noBorder,bottom:noBorder,left:noBorder,right:noBorder,
  insideHorizontal:noBorder,
  insideVertical:{style:BorderStyle.SINGLE,size:4,color:"C9C4B9"}
 };
 const rows=[
  new TableRow({
   tableHeader:true,
   children:[
    new TableCell({
     width:{size:cellWidth,type:WidthType.DXA},
     margins:{top:90,bottom:90,left:style.cellPad,right:style.cellPad},
     children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"LATINH",bold:true,font:"Times New Roman",size:20})]})]
    }),
    new TableCell({
     width:{size:cellWidth,type:WidthType.DXA},
     margins:{top:90,bottom:90,left:style.cellPad,right:style.cellPad},
     children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"TIẾNG VIỆT",bold:true,font:"Times New Roman",size:20})]})]
    })
   ]
  })
 ];
 exportItems(entry).forEach(item=>{
  rows.push(new TableRow({
   children:[
    makeWordCell(item,"la",cellWidth,style),
    makeWordCell(item,"vi",cellWidth,style)
   ]
  }));
 });
 const children=[
  new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:90},
   children:[new TextRun({text:title+" — "+dateInfo.dateText+", "+dateInfo.weekdayTitle,bold:true,font:"Times New Roman",size:isA5?28:32})]
  }),
  ...(latinTitle?[new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:75},
   children:[new TextRun({text:latinTitle,italics:true,font:"Times New Roman",size:22})]
  })]:[]),
  ...(meta?[new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:130},
   children:[new TextRun({text:meta,font:"Times New Roman",size:18})]
  })]:[]),
  new Table({
   width:{size:100,type:WidthType.PERCENTAGE},
   columnWidths:[cellWidth,cellWidth],
   rows,
   borders:tableBorders
  }),
  ...(entry.demo?[new Paragraph({
   spacing:{before:120},
   children:[new TextRun({text:"Dữ liệu minh họa — cần đối chiếu bản văn trước khi sử dụng chính thức.",italics:true,font:"Times New Roman",size:16})]
  })]:[])
 ];
 const header=new Header({children:[
  new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"ORDO ROMANUS · MISSALE ROMANUM 1962",font:"Times New Roman",size:15})]})
 ]});
 const footer=new Footer({children:[
  new Paragraph({
   alignment:AlignmentType.CENTER,
   children:[
    new TextRun({text:"Ordo Romanus  ·  ",font:"Times New Roman",size:14}),
    new TextRun({children:[PageNumber.CURRENT],font:"Times New Roman",size:14})
   ]
  })
 ]});
 const doc=new Document({
  creator:"Ordo Romanus",
  title:title+" — "+dateInfo.dateText,
  description:"Sách lễ song ngữ Latinh — Việt",
  sections:[{
   properties:{page:{size:{width:pageWidth,height:pageHeight},margin:{top:margin,bottom:margin,left:margin,right:margin,header:360,footer:360}}},
   headers:{default:header},
   footers:{default:footer},
   children
  }]
 });
 return await Packer.toBlob(doc);
}

function renderExportUI(){
 document.querySelectorAll("[data-format]").forEach(button=>{
  const active=button.dataset.format===exportFormat;
  button.classList.toggle("active",active);
  button.setAttribute("aria-pressed",String(active));
 });
 document.querySelectorAll("[data-page]").forEach(button=>{
  const blocked=exportFormat==="docx"&&button.dataset.page==="booklet";
  button.disabled=blocked;
  button.classList.toggle("active",button.dataset.page===exportPage);
  button.setAttribute("aria-pressed",String(button.dataset.page===exportPage));
  if(blocked)button.title="Word không hỗ trợ dàn trang A5 booklet.";
  else button.removeAttribute("title");
 });
 $export("booklet-note").hidden=!(exportFormat==="pdf"&&exportPage==="booklet");
 const pageLabel=exportPage==="booklet"?"A5 booklet":exportPage;
 const formatLabel=exportFormat==="pdf"?"PDF":"Word (DOCX)";
 $export("export-summary").textContent="Latinh và Tiếng Việt song song · Lễ riêng · "+pageLabel+" · "+formatLabel;
 $export("export-run-label").textContent=exportBusy?"Đang xử lý…":"Xuất file";
 $export("export-run").disabled=exportBusy;
 $export("export-spinner").hidden=!exportBusy;
}
function openExportModal(dateKey){
 const entry=exportEntry(dateKey);
 if(!exportHasData(entry)){showToast("Chưa có dữ liệu sách lễ cho ngày này.");return;}
 currentModalDateKey=dateKey;
 exportFormat="pdf";exportPage="A4";exportBusy=false;
 $export("export-date").textContent=dateFormatter.format(new Date(dateKey+"T12:00:00"));
 renderExportUI();
 $export("export-modal").showModal();
}
async function runExport(){
 if(exportBusy)return;
 const dateKey=currentModalDateKey,entry=exportEntry(dateKey);
 if(!exportHasData(entry)){showToast("Chưa có dữ liệu sách lễ cho ngày này.");return;}
 exportBusy=true;renderExportUI();
 try{
  await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,50)));
  const [year,month,day]=dateKey.split("-").map(Number);
  const date=new Date(year,month-1,day);
  const format=exportFormat,page=exportPage;
  const fileName=exportFilename(dateKey,entry,format,page);
  const blob=format==="pdf"?await createPdf(entry,date,page):await createDocx(entry,date,page);
  exportDownload(blob,fileName);
  $export("export-modal").close();
  showToast("Đã tạo và tải xuống: "+fileName);
 }catch(error){
  console.error("Export the Mass error:",error);
  showToast("Không thể xuất file: "+(error&&error.message?error.message:"Lỗi không xác định."));
 }finally{
  exportBusy=false;
  if($export("export-modal").open)renderExportUI();
 }
}

$export("export-close").addEventListener("click",()=>$export("export-modal").close());
$export("export-modal").addEventListener("click",event=>{
 if(event.target===$export("export-modal"))$export("export-modal").close();
});
document.querySelectorAll("[data-format]").forEach(button=>button.addEventListener("click",()=>{
 exportFormat=button.dataset.format;
 if(exportFormat==="docx"&&exportPage==="booklet")exportPage="A5";
 renderExportUI();
}));
document.querySelectorAll("[data-page]").forEach(button=>button.addEventListener("click",()=>{
 if(button.disabled)return;
 exportPage=button.dataset.page;
 renderExportUI();
}));
$export("export-run").addEventListener("click",runExport);

// Được gọi từ nút "Xuất file" trong modal chi tiết sách lễ.
window.openExportModal=openExportModal;
})();