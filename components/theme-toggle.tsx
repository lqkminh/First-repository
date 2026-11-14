"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
export function ThemeToggle() { const [dark,setDark]=useState(false); useEffect(()=>{const saved=localStorage.getItem("missa-theme");const next=saved?saved==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;setDark(next);document.documentElement.classList.toggle("dark",next);},[]);function toggle(){const next=!dark;setDark(next);document.documentElement.classList.toggle("dark",next);localStorage.setItem("missa-theme",next?"dark":"light");}return <button className="icon-button" type="button" onClick={toggle} aria-label="Đổi giao diện sáng/tối">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>; }
