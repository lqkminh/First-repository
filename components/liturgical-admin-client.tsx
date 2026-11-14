"use client";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
type DraftSection={sectionKey:string;labelLa:string;labelVi:string;textLa:string;textVi:string;referenceLa:string;referenceVi:string};
const blankSection=():DraftSection=>({sectionKey:"introitus",labelLa:"Introitus",labelVi:"Ca đầu lễ",textLa:"",textVi:"",referenceLa:"",referenceVi:""});
export function LiturgicalAdminClient(){
 const [calendar,setCalendar]=useState("ROMAN_1962");const [civilDate,setCivilDate]=useState(new Date().toISOString().slice(0,10));
 const [titleVi,setTitleVi]=useState("");const [titleLa,setTitleLa]=useState("");const [rankVi,setRankVi]=useState("");const [rankLa,setRankLa]=useState("");
 const [color,setColor]=useState("WHITE");const [seasonVi,setSeasonVi]=useState("");const [status,setStatus]=useState("DRAFT");
 const [isSunday,setIsSunday]=useState(false);const [isSolemnity,setIsSolemnity]=useState(false);const [sections,setSections]=useState<DraftSection[]>([blankSection()]);
 const [saving,setSaving]=useState(false);const [message,setMessage]=useState("");
 function updateSection(index:number,key:keyof DraftSection,value:string){setSections(current=>current.map((section,i)=>i===index?{...section,[key]:value}:section));}
 async function save(event:React.FormEvent){
  event.preventDefault();setSaving(true);setMessage("");
  try{
   const dayResponse=await fetch("/api/admin/liturgical-days",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({calendar,civilDate,titleVi,titleLa,rankVi,rankLa,liturgicalColor:color,seasonVi,status,isSunday,isSolemnity})});
   const dayData=await dayResponse.json();if(!dayResponse.ok)throw new Error(typeof dayData.error==="string"?dayData.error:"Không thể lưu ngày lễ.");
   for(let index=0;index<sections.length;index++){
    const section=sections[index];
    const response=await fetch("/api/admin/liturgical-days/"+dayData.day.id+"/sections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...section,position:index+1,status,accessScope:"MEMBER"})});
    const data=await response.json();if(!response.ok)throw new Error("Đã lưu ngày lễ nhưng mục "+(index+1)+" chưa lưu được: "+JSON.stringify(data.error));
   }
   setMessage("Đã lưu ngày lễ và "+sections.length+" mục. Bản văn chỉ hiển thị sau khi được duyệt và xuất bản.");
  }catch(error){setMessage(error instanceof Error?error.message:"Có lỗi xảy ra.");}finally{setSaving(false);}
 }
 return <form className="admin-form" onSubmit={save}>
  <div className="admin-form-grid">
   <label>Niên lịch<select value={calendar} onChange={e=>setCalendar(e.target.value)}><option value="ROMAN_1962">Rôma 1962</option><option value="PRE_1955">Trước 1955</option></select></label>
   <label>Ngày theo lịch dân sự<input type="date" value={civilDate} onChange={e=>setCivilDate(e.target.value)} required/></label>
   <label>Tên lễ tiếng Việt<input value={titleVi} onChange={e=>setTitleVi(e.target.value)} required/></label>
   <label>Tên lễ Latin<input value={titleLa} onChange={e=>setTitleLa(e.target.value)}/></label>
   <label>Bậc lễ (VI)<input value={rankVi} onChange={e=>setRankVi(e.target.value)}/></label>
   <label>Bậc lễ (LA)<input value={rankLa} onChange={e=>setRankLa(e.target.value)}/></label>
   <label>Màu phụng vụ<select value={color} onChange={e=>setColor(e.target.value)}><option value="WHITE">Trắng</option><option value="GREEN">Xanh</option><option value="PURPLE">Tím</option><option value="RED">Đỏ</option><option value="ROSE">Hồng</option><option value="BLACK">Đen</option><option value="GOLD">Vàng</option></select></label>
   <label>Mùa phụng vụ<input value={seasonVi} onChange={e=>setSeasonVi(e.target.value)}/></label>
   <label>Trạng thái<select value={status} onChange={e=>setStatus(e.target.value)}><option value="DRAFT">Bản nháp</option><option value="IN_REVIEW">Chờ duyệt</option><option value="PUBLISHED">Xuất bản (Admin)</option></select></label>
  </div>
  <div className="admin-checks"><label><input type="checkbox" checked={isSunday} onChange={e=>setIsSunday(e.target.checked)}/> Chúa Nhật</label><label><input type="checkbox" checked={isSolemnity} onChange={e=>setIsSolemnity(e.target.checked)}/> Lễ trọng</label></div>
  <div className="admin-section-heading"><div><h2>Các mục sách lễ</h2><p>Nhập song song Latin và tiếng Việt theo đúng thứ tự.</p></div><button type="button" className="today-button" onClick={()=>setSections(current=>[...current,blankSection()])}><Plus size={14}/> Thêm mục</button></div>
  {sections.map((section,index)=><section className="admin-section-editor" key={index}>
   <div className="admin-section-top"><strong>Mục {index+1}</strong><button type="button" className="icon-button" aria-label="Xóa mục" disabled={sections.length===1} onClick={()=>setSections(current=>current.filter((_,i)=>i!==index))}><Trash2 size={15}/></button></div>
   <div className="admin-form-grid"><label>Khóa mục<input value={section.sectionKey} onChange={e=>updateSection(index,"sectionKey",e.target.value)}/></label><label>Nhãn Latin<input value={section.labelLa} onChange={e=>updateSection(index,"labelLa",e.target.value)}/></label><label>Nhãn tiếng Việt<input value={section.labelVi} onChange={e=>updateSection(index,"labelVi",e.target.value)}/></label><label>Tham chiếu Latin<input value={section.referenceLa} onChange={e=>updateSection(index,"referenceLa",e.target.value)}/></label><label>Tham chiếu tiếng Việt<input value={section.referenceVi} onChange={e=>updateSection(index,"referenceVi",e.target.value)}/></label></div>
   <div className="admin-form-grid two-col"><label>Văn bản Latin<textarea rows={5} value={section.textLa} onChange={e=>updateSection(index,"textLa",e.target.value)}/></label><label>Văn bản tiếng Việt<textarea rows={5} value={section.textVi} onChange={e=>updateSection(index,"textVi",e.target.value)}/></label></div>
  </section>)}
  <button className="button button-wine save-admin" type="submit" disabled={saving}><Save size={15}/>{saving?"Đang lưu...":"Lưu ngày lễ và bản văn"}</button>
  {message&&<p className="admin-feedback" role="status">{message}</p>}
 </form>;
}
