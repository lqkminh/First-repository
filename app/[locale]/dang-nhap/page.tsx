"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const callbackUrl="/vi";
  return (
    <main className="container auth-shell">
      <section className="auth-card">
        <p className="eyebrow">THÁNH LỄ MISSA · TÀI KHOẢN</p>
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để truy cập thư viện và quản lý hội viên của bạn.</p>
        <button className="auth-provider" onClick={()=>signIn("google",{callbackUrl})}>Tiếp tục với Google</button>
        <div className="auth-separator"><span>hoặc dùng email</span></div>
        <form onSubmit={async event=>{event.preventDefault();setMessage("Đang gửi liên kết đăng nhập...");const result=await signIn("email",{email,callbackUrl,redirect:false});setMessage(result?.error?"Không gửi được email. Vui lòng thử lại.":"Hãy kiểm tra email để mở liên kết đăng nhập.");}}>
          <label htmlFor="email">Địa chỉ email</label>
          <input id="email" type="email" value={email} onChange={event=>setEmail(event.target.value)} required placeholder="ten@example.com"/>
          <button className="button button-wine" type="submit">Gửi liên kết đăng nhập</button>
        </form>
        {message&&<p className="auth-message" role="status">{message}</p>}
        <small>Email magic link cần cấu hình SMTP; Google OAuth cần cấu hình Client ID/Secret.</small>
      </section>
    </main>
  );
}
