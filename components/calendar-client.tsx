"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, LockKeyhole, ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { dateKey, getMonthGrid, getWeekRange, getYearRange, type CalendarView } from "@/lib/calendar-utils";

type CalendarCode = "ROMAN_1962" | "PRE_1955";
type DaySummary = { id:string; civilDate:string; titleVi:string; titleLa:string|null; rankVi:string|null; liturgicalColor:string|null; isSunday:boolean; isSolemnity:boolean; lectionaryCycle?:string|null };
type DayDetail = DaySummary & { seasonVi:string|null; sections:Array<{id:string;labelLa:string|null;labelVi:string;referenceLa:string|null;referenceVi:string|null;textLa:string|null;textVi:string|null}>; saints:Array<{saint:{nameVi:string;nameLa:string|null}}>; accessLimited?:boolean };
const weekdaysVi = ["Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy","Chúa Nhật"];
const weekdaysEn = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const colors:Record<string,string> = {GREEN:"green",PURPLE:"purple",WHITE:"white",RED:"red",ROSE:"rose",BLACK:"black",GOLD:"gold"};
function periodFor(view:CalendarView,date:Date) {
  if(view==="today") return {from:date,to:date};
  if(view==="week") return getWeekRange(date);
  if(view==="year") return getYearRange(date.getFullYear());
  return {from:new Date(date.getFullYear(),date.getMonth(),1),to:new Date(date.getFullYear(),date.getMonth()+1,0)};
}

export function CalendarClient() {
  const t=useTranslations("Calendar");
  const locale=useLocale();
  const [calendar,setCalendar]=useState<CalendarCode>("ROMAN_1962");
  const [view,setView]=useState<CalendarView>("month");
  const [activeDate,setActiveDate]=useState(()=>new Date());
  const [days,setDays]=useState<DaySummary[]>([]);
  const [selected,setSelected]=useState<DayDetail|null>(null);
  const [loading,setLoading]=useState(false);
  const [detailLoading,setDetailLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const range=useMemo(()=>periodFor(view,activeDate),[view,activeDate]);
  const dateMap=useMemo(()=>new Map(days.map(day=>[day.civilDate.slice(0,10),day])),[days]);
  const monthDays=useMemo(()=>getMonthGrid(activeDate.getFullYear(),activeDate.getMonth()),[activeDate]);
  const weekDays=useMemo(()=>{const w=getWeekRange(activeDate);return Array.from({length:7},(_,i)=>new Date(w.from.getFullYear(),w.from.getMonth(),w.from.getDate()+i));},[activeDate]);
  const english=locale==="en";
  const dateLocale=english?"en-US":"vi-VN";
  const weekdayLabels=locale==="en"?weekdaysEn:weekdaysVi;

  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError(null);
    const params=new URLSearchParams({calendar,from:dateKey(range.from),to:dateKey(range.to)});
    fetch("/api/liturgical/calendar?"+params.toString(),{signal:controller.signal})
      .then(async response=>{if(!response.ok)throw new Error("Không thể tải lịch phụng vụ.");return response.json();})
      .then(data=>setDays(data.days??[]))
      .catch(err=>{if(err.name!=="AbortError")setError(err.message);})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[calendar,range]);

  function movePeriod(direction:number) {
    if(view==="year")setActiveDate(new Date(activeDate.getFullYear()+direction,activeDate.getMonth(),1));
    else if(view==="week")setActiveDate(new Date(activeDate.getFullYear(),activeDate.getMonth(),activeDate.getDate()+direction*7));
    else if(view==="today")setActiveDate(new Date(activeDate.getFullYear(),activeDate.getMonth(),activeDate.getDate()+direction));
    else setActiveDate(new Date(activeDate.getFullYear(),activeDate.getMonth()+direction,1));
  }
  async function openDay(date:Date) {
    setSelected(null);setDetailLoading(true);
    try {
      const params=new URLSearchParams({calendar,date:dateKey(date)});
      const response=await fetch("/api/liturgical/day?"+params.toString());
      const data=await response.json();
      if(response.status===403){
        setSelected({id:"locked",civilDate:dateKey(date),titleVi:"Nội dung dành cho hội viên",titleLa:null,rankVi:null,liturgicalColor:null,isSunday:false,isSolemnity:false,seasonVi:null,sections:[],saints:[],accessLimited:true});
        return;
      }
      if(!response.ok&&response.status!==404)throw new Error(data.error||"Không thể tải bản văn.");
      setSelected(data.day??null);
    } catch(err) {setError(err instanceof Error?err.message:"Có lỗi xảy ra.");}
    finally {setDetailLoading(false);}
  }

  const heading=view==="year"?String(activeDate.getFullYear()):new Intl.DateTimeFormat(dateLocale,{month:"long",year:"numeric"}).format(activeDate);
  const shownDays=view==="today"?[activeDate]:view==="week"?weekDays:monthDays;
  return (
    <div className="calendar-card">
      <div className="calendar-toolbar">
        <div className="calendar-period">
          <div className="period-nav">
            <button className="icon-button" onClick={()=>movePeriod(-1)} aria-label={t("previous")}><ChevronLeft size={18}/></button>
            <h3>{heading}</h3>
            <button className="icon-button" onClick={()=>movePeriod(1)} aria-label={t("next")}><ChevronRight size={18}/></button>
          </div>
          <button className="today-button" onClick={()=>{setActiveDate(new Date());setView("month");}}>{t("today")}</button>
        </div>
        <div className="calendar-controls">
          <div className="calendar-select"><label htmlFor="calendar-code">{t("chooseCalendar")}</label><select id="calendar-code" value={calendar} onChange={e=>setCalendar(e.target.value as CalendarCode)}><option value="ROMAN_1962">{t("roman1962")}</option><option value="PRE_1955">{t("pre1955")}</option></select></div>
          <div className="view-switch" role="group" aria-label="Chế độ xem lịch">
            {(["today","week","month","year"] as CalendarView[]).map(item=><button key={item} onClick={()=>setView(item)} className={view===item?"selected":""}>{t(item==="today"?"todayView":item)}</button>)}
          </div>
        </div>
      </div>
      {loading&&<p className="calendar-status">{t("loading")}</p>}
      {error&&<p className="calendar-error" role="alert">{error}</p>}
      {view==="year"?(
        <div className="year-grid">{Array.from({length:12},(_,month)=><button key={month} className="year-month" onClick={()=>{setActiveDate(new Date(activeDate.getFullYear(),month,1));setView("month");}}><strong>{new Intl.DateTimeFormat(dateLocale,{month:"long"}).format(new Date(activeDate.getFullYear(),month,1))}</strong><span>{days.filter(day=>Number(day.civilDate.slice(5,7))===month+1).length} {english?"days with data":"ngày có dữ liệu"}</span></button>)}</div>
      ):(
        <div className={view==="today"?"today-view":"calendar-grid"}>
          {view!=="today"&&weekdayLabels.map(day=><div className="weekday" key={day}>{day}</div>)}
          {shownDays.map(day=>{
            const key=dateKey(day);const entry=dateMap.get(key);const outside=view==="month"&&day.getMonth()!==activeDate.getMonth();const isToday=key===dateKey(new Date());
            const classes=["calendar-day",outside?"outside":"",isToday?"is-today":"",entry?.isSunday?"is-sunday":"",entry?.isSolemnity?"is-solemnity":""].filter(Boolean).join(" ");
            return <button key={key} className={classes} onClick={()=>openDay(day)}>
              <span className="day-number">{day.getDate()}</span>
              {entry?<><span className="day-color"><i className={"color-dot "+(colors[entry.liturgicalColor??""]??"none")}/>{entry.titleVi}</span><span className="day-rank">{entry.rankVi??entry.titleLa??""}</span></>:<span className="day-empty">{outside?"":""}</span>}
            </button>;
          })}
        </div>
      )}
      {!loading&&days.length===0&&<p className="calendar-hint">{english?"No liturgical days have been published for this period yet. Reviewed entries will appear here after editorial approval.":"Chưa có ngày lễ đã xuất bản trong khoảng thời gian này. Dữ liệu sẽ xuất hiện sau khi biên tập viên duyệt và công bố."}</p>}
      <div className="calendar-legend"><span><i className="color-dot green"/> {english?"Green":"Xanh"}</span><span><i className="color-dot purple"/> {english?"Violet":"Tím"}</span><span><i className="color-dot white"/> {english?"White":"Trắng"}</span><span><i className="color-dot red"/> {english?"Red":"Đỏ"}</span><span><i className="color-dot rose"/> {english?"Rose":"Hồng"}</span></div>
      {(selected||detailLoading)&&<div className="modal-backdrop" role="presentation" onClick={()=>{setSelected(null);setDetailLoading(false);}}>
        <section className="day-modal" role="dialog" aria-modal="true" aria-labelledby="day-title" onClick={e=>e.stopPropagation()}>
          <button className="modal-close icon-button" onClick={()=>{setSelected(null);setDetailLoading(false);}} aria-label={t("close")}><X size={18}/></button>
          {detailLoading?<p className="calendar-status">{t("loading")}</p>:selected?<><p className="eyebrow">{calendar==="ROMAN_1962"?"MISSALE ROMANUM 1962":"CALENDARIUM ANTE 1955"}</p><p className="modal-date">{new Intl.DateTimeFormat(dateLocale,{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(selected.civilDate+"T12:00:00"))}</p><h3 id="day-title">{selected.titleVi}</h3>{selected.titleLa&&<p className="latin-title">{selected.titleLa}</p>}
            <div className="day-meta">{selected.rankVi&&<span>{t("rank")}: {selected.rankVi}</span>}{selected.liturgicalColor&&<span>{t("color")}: {selected.liturgicalColor}</span>}{selected.seasonVi&&<span>{t("season")}: {selected.seasonVi}</span>}{selected.lectionaryCycle&&<span>{t("cycle")}: {selected.lectionaryCycle}</span>}</div>
            {selected.accessLimited&&<div className="member-notice"><LockKeyhole size={16}/><span>{english?"Some texts are reserved for members of the corresponding liturgical calendar.":"Một số phần bản văn chỉ dành cho hội viên đã đăng ký niên lịch tương ứng."}</span><Link href="/hoi-vien">{english?"Membership plans":"Xem gói hội viên"} <ArrowRight size={13}/></Link></div>}
            <div className="parallel-readings">{selected.sections.map(section=><article className="parallel-section" key={section.id}><div><h4>{section.labelLa??"—"}</h4>{section.referenceLa&&<small>{section.referenceLa}</small>}<p>{section.textLa??"—"}</p></div><div><h4>{section.labelVi}</h4>{section.referenceVi&&<small>{section.referenceVi}</small>}<p>{section.textVi??"—"}</p></div></article>)}</div>
            {selected.saints.length>0&&<p className="saint-line">Thánh kính nhớ: {selected.saints.map(x=>x.saint.nameVi).join(", ")}</p>}
            {selected.sections.length===0&&<p className="calendar-hint">{selected.accessLimited?(english?"Sign in and subscribe to the corresponding ORDO plan to view the full texts for this date.":"Đăng nhập và đăng ký gói ORDO tương ứng để mở toàn bộ bản văn của ngày này."):t("noData")}</p>}
          </>:<p className="calendar-hint">{t("noData")}</p>}
        </section>
      </div>}
    </div>
  );
}
