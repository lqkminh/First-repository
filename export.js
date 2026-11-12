/* Export the Mass — tạo PDF/DOCX ngay trên trình duyệt. */
(function(){
"use strict";
const $export = id => document.getElementById(id);
let exportFormat="pdf";
let exportPage="A4";
let exportBusy=false;

function exportEntry(dateKey){return ORDO_DATA[dateKey]||null;}
function exportHasData(entry){
 return !!entry&&(
  (Array.isArray(entry.readings)&&entry.readings.length>0)||
  (Array.isArray(entry.prayers)&&entry.prayers.length>0)
 );
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
function exportGroups(entry){
 return [
  {latin:"PROPRIUM DE TEMPORE",vietnamese:"PHẦN RIÊNG",items:Array.isArray(entry.readings)?entry.readings:[]},
  {latin:"ORATIONES",vietnamese:"CÁC LỜI NGUYỆN",items:Array.isArray(entry.prayers)?entry.prayers:[]}
 ].filter(group=>group.items.length);
}
function exportSafeName(value){
 return String(value||"SachLe").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/đ/g,"d").replace(/Đ/g,"D")
  .replace(/[^a-zA-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,64)||"SachLe";
}
function exportFilename(dateKey,entry,format,page){
 const paper=page==="booklet"?"A5_booklet":page;
 return "SachLe_"+exportSafeName(exportTitle(entry))+"_"+dateKey+"_"+paper+"."+(format==="pdf"?"pdf":"docx");
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
function pdfCell(item,lang,isA5){
 return {
  stack:[
   {text:exportText(item,lang,"label"),bold:true,fontSize:isA5?8:9.4,color:"#a32139",margin:[0,0,0,3]},
   {text:exportText(item,lang,"reference"),fontSize:isA5?7:8,italics:true,color:"#8b7958",margin:[0,0,0,5]},
   {text:exportText(item,lang,"text"),fontSize:isA5?7.6:9,lineHeight:1.35,color:"#302c27"}
  ],
  margin:[8,isA5?7:9,8,isA5?8:10],
  fillColor:"#fffefa",
  verticalAlignment:"top"
 };
}
function pdfDefinition(entry,date,pageSize){
 const isA5=pageSize==="A5";
 const dateInfo=exportParts(date);
 const title=exportTitle(entry),latinTitle=exportLatinTitle(entry);
 const rows=[[
  {text:"LATINH",style:"languageHeader"},
  {text:"TIẾNG VIỆT",style:"languageHeader"}
 ]];
 exportGroups(entry).forEach(group=>{
  rows.push([
   {text:group.latin,style:"groupHeader"},
   {text:group.vietnamese,style:"groupHeader"}
  ]);
  group.items.forEach(item=>rows.push([pdfCell(item,"la",isA5),pdfCell(item,"vi",isA5)]));
 });
 const meta=[entry.rank,entry.color,entry.season].filter(Boolean).join("   ·   ");
 const margins=isA5?[28,42,28,42]:[42,48,42,48];
 return {
  pageSize,
  pageOrientation:"portrait",
  pageMargins:margins,
  info:{title:title+" — "+dateInfo.dateText,author:"Ordo Romanus",subject:"Proprium Missae · Latinum — Vietnamese"},
  header:function(){
   return {text:latinTitle||title,alignment:"center",fontSize:isA5?7:8,color:"#7d7467",italics:true,margin:[margins[0],15,margins[2],0]};
  },
  footer:function(pageNumber,pageCount){
   return {
    columns:[
     {text:"Ordo Romanus · Missale Romanum 1962",fontSize:isA5?6.5:7.5,color:"#80796d"},
     {text:String(pageNumber),alignment:"center",fontSize:isA5?7:8,color:"#a32139"},
     {text:"Xuất ngày "+new Intl.DateTimeFormat("vi-VN").format(new Date()),alignment:"right",fontSize:isA5?6.5:7.5,color:"#80796d"}
    ],
    margin:[margins[0],0,margins[2],17]
   };
  },
  content:[
   {text:"MISSALE ROMANUM · ANNO DOMINI",style:"overline"},
   {text:title+" — "+dateInfo.dateText+", "+dateInfo.weekdayTitle,style:"title"},
   ...(latinTitle?[{text:latinTitle,style:"latinTitle"}]:[]),
   ...(meta?[{text:meta,style:"metadata"}]:[]),
   {canvas:[{type:"line",x1:0,y1:0,x2:120,y2:0,lineWidth:.6,lineColor:"#b59659"}],alignment:"center",margin:[0,7,0,10]},
   {
    table:{headerRows:1,widths:["*","*"],body:rows},
    layout:{
     hLineWidth:function(i){return i===1?0.6:0.25;},
     vLineWidth:function(i){return i===1?0.55:0;},
     hLineColor:function(){return "#e5e0d4";},
     vLineColor:function(){return "#d8d0c2";},
     paddingLeft:function(){return 6;},
     paddingRight:function(){return 6;},
     paddingTop:function(){return 5;},
     paddingBottom:function(){return 5;}
    },
    keepWithHeaderRows:1,
    dontBreakRows:true
   },
   ...(entry.demo?[{text:"DỮ LIỆU MINH HỌA — Cần đối chiếu bản văn và lịch phụng vụ trước khi sử dụng chính thức.",style:"disclaimer"}]:[])
  ],
  defaultStyle:{font:"Roboto",fontSize:isA5?7.6:9,color:"#302c27"},
  styles:{
   overline:{fontSize:isA5?7:8,bold:true,color:"#9a835c",characterSpacing:1.1,alignment:"center",margin:[0,0,0,5]},
   title:{fontSize:isA5?14:18,bold:true,color:"#a32139",alignment:"center",lineHeight:1.15,margin:[0,0,0,4]},
   latinTitle:{fontSize:isA5?9:11,italics:true,color:"#766d60",alignment:"center",margin:[0,0,0,6]},
   metadata:{fontSize:isA5?7:8,color:"#686c62",alignment:"center",margin:[0,0,0,5]},
   languageHeader:{fontSize:isA5?7.5:8.5,bold:true,color:"#8a2036",alignment:"center",margin:[0,4,0,5]},
   groupHeader:{fontSize:isA5?7.5:8.5,bold:true,color:"#725a30",fillColor:"#f5f0e5",margin:[5,6,5,6]},
   disclaimer:{fontSize:isA5?6.5:7.5,italics:true,color:"#8a6b3b",margin:[0,10,0,0]}
  }
 };
}

/*
 * Dàn trang booklet A5 lên tờ A4 ngang.
 * N trang nguồn được đệm lên bội số 4.
 * Mỗi tờ: mặt trước [N - 2i | 1 + 2i], mặt sau [2 + 2i | N - 1 - 2i].
 * Thứ tự này khớp mẫu: [trang cuối | trang 1], [trang 2 | trang kế cuối]...
 */
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
 if(!window.pdfMake||typeof window.pdfMake.createPdf!=="function")throw new Error("Không tải được pdfmake. Hãy kiểm tra kết nối Internet.");
 const logicalPage=page==="booklet"?"A5":page;
 const a5orA4=await window.pdfMake.createPdf(pdfDefinition(entry,date,logicalPage)).getBlob();
 return page==="booklet"?await imposeBooklet(a5orA4):a5orA4;
}

function makeWordCell(item,lang,cellWidth,style){
 const d=window.docx;
 const {Paragraph,TextRun,TableCell,AlignmentType,VerticalAlign,WidthType}=d;
 const label=exportText(item,lang,"label");
 const reference=exportText(item,lang,"reference");
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
   new Paragraph({
    keepNext:true,spacing:{after:75},
    children:[new TextRun({text:reference,italics:true,color:"81745F",font:"Times New Roman",size:style.referenceSize})]
   }),
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
 const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,Header,Footer,AlignmentType,WidthType,BorderStyle,VerticalAlign,PageNumber}=d;
 const isA5=page==="A5";
 const pageWidth=isA5?8391:11906;
 const pageHeight=isA5?11906:16838;
 const margin=isA5?620:900;
 const contentWidth=pageWidth-2*margin;
 const cellWidth=Math.floor(contentWidth/2);
 const style={
  cellPad:isA5?105:150,before:isA5?65:110,after:isA5?110:155,
  line:isA5?265:290,labelSize:isA5?16:18,
  referenceSize:isA5?15:17,bodySize:isA5?18:20
 };
 const dateInfo=exportParts(date);
 const title=exportTitle(entry),latinTitle=exportLatinTitle(entry);
 const meta=[entry.rank,entry.color,entry.season].filter(Boolean).join(" · ");
 const noBorder={style:BorderStyle.NIL,size:0,color:"FFFFFF"};
 const tableBorders={
  top:noBorder,bottom:noBorder,left:noBorder,right:noBorder,
  insideHorizontal:noBorder,
  insideVertical:{style:BorderStyle.SINGLE,size:5,color:"D8D0C2"}
 };
 const rows=[
  new TableRow({
   tableHeader:true,cantSplit:true,
   children:[
    new TableCell({
     width:{size:cellWidth,type:WidthType.DXA},shading:{fill:"F6F0E6"},
     margins:{top:100,bottom:100,left:style.cellPad,right:style.cellPad},
     children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"LATINH",bold:true,color:"8A2036",font:"Times New Roman",size:17})]})]
    }),
    new TableCell({
     width:{size:cellWidth,type:WidthType.DXA},shading:{fill:"F6F0E6"},
     margins:{top:100,bottom:100,left:style.cellPad,right:style.cellPad},
     children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"TIẾNG VIỆT",bold:true,color:"8A2036",font:"Times New Roman",size:17})]})]
    })
   ]
  })
 ];
 exportGroups(entry).forEach(group=>{
  rows.push(new TableRow({
   cantSplit:true,
   children:[
    new TableCell({
     width:{size:cellWidth,type:WidthType.DXA},shading:{fill:"F8F5EC"},
     margins:{top:90,bottom:80,left:style.cellPad,right:style.cellPad},
     children:[new Paragraph({children:[new TextRun({text:group.latin,bold:true,smallCaps:true,color:"8A6B3C",font:"Times New Roman",size:16})]})]
    }),
    new TableCell({
     width:{size:cellWidth,type:WidthType.DXA},shading:{fill:"F8F5EC"},
     margins:{top:90,bottom:80,left:style.cellPad,right:style.cellPad},
     children:[new Paragraph({children:[new TextRun({text:group.vietnamese,bold:true,smallCaps:true,color:"8A6B3C",font:"Times New Roman",size:16})]})]
    })
   ]
  }));
  group.items.forEach(item=>{
   rows.push(new TableRow({cantSplit:true,children:[makeWordCell(item,"la",cellWidth,style),makeWordCell(item,"vi",cellWidth,style)]}));
  });
 });
 const children=[
  new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:80},
   children:[new TextRun({text:dateInfo.weekdayTitle.toUpperCase()+", "+dateInfo.dateText+" · "+(entry.season||"MISSALE ROMANUM 1962").toUpperCase(),bold:true,color:"827764",font:"Times New Roman",size:isA5?14:16,allCaps:true})]
  }),
  new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:60},
   children:[new TextRun({text:title,bold:true,color:"A32139",font:"Georgia",size:isA5?30:36})]
  }),
  ...(latinTitle?[new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:70},
   children:[new TextRun({text:latinTitle,italics:true,color:"756B5D",font:"Georgia",size:isA5?19:21})]
  })]:[]),
  ...(meta?[new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:130},
   children:[new TextRun({text:meta,italics:true,color:"5B625A",font:"Georgia",size:isA5?17:19})]
  })]:[]),
  new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:150},
   children:[new TextRun({text:"——————  ✠  ——————",color:"A32139",font:"Times New Roman",size:17})]
  }),
  ...(entry.demo?[new Paragraph({
   alignment:AlignmentType.CENTER,spacing:{after:100},
   children:[new TextRun({text:"DỮ LIỆU MINH HỌA — Cần đối chiếu bản văn trước khi sử dụng chính thức.",italics:true,color:"8A6B3B",font:"Times New Roman",size:14})]
  })]:[]),
  new Table({
   width:{size:100,type:WidthType.PERCENTAGE},
   columnWidths:[cellWidth,cellWidth],
   rows,
   borders:tableBorders
  })
 ];
 const header=new Header({children:[
  new Paragraph({
   alignment:AlignmentType.CENTER,
   children:[new TextRun({text:latinTitle||title,italics:true,color:"827764",font:"Georgia",size:15})]
  })
 ]});
 const footer=new Footer({children:[
  new Paragraph({
   alignment:AlignmentType.CENTER,
   children:[
    new TextRun({text:"ORDO ROMANUS  ·  ",color:"827764",font:"Times New Roman",size:14}),
    new TextRun({children:[PageNumber.CURRENT],color:"A32139",font:"Times New Roman",size:14})
   ]
  })
 ]});
 const doc=new Document({
  creator:"Ordo Romanus",
  title:title+" — "+dateInfo.dateText,
  description:"Proprium Missae · Latinum et Vietnamita",
  sections:[{
   properties:{page:{size:{width:pageWidth,height:pageHeight},margin:{top:margin,bottom:margin,left:margin,right:margin,header:380,footer:380}}},
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