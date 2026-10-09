"use client";
import Link from "next/link";
interface GlassCardProps { children:React.ReactNode; className?:string; href?:string; onClick?:()=>void; interactive?:boolean; }
export function GlassCard({children,className="",href,onClick,interactive=true}:GlassCardProps){
 const classes=`stack-panel relative ${interactive?"transition-colors hover:border-slate-500":""} ${className}`;
 if(href)return <Link className={`block ${classes}`} href={href}>{children}</Link>;
 if(onClick)return <button className={classes} onClick={onClick}>{children}</button>;
 return <div className={classes}>{children}</div>;
}
