import{useEffect,useState}from"react";import{CalendarDays,Clock,MapPin,Music2,Phone,ShieldAlert,Users}from"lucide-react";import{useAuth}from"../contexts/AuthContext";import{listShifts,listArtists,listTimetable,listLocations,listCrewContacts,listEmergencyInfo,takeShift,leaveShift}from"../services/festival";

const demo={
 shifts:[
  {id:"s1",title:"Einlass",starts_at:"2026-09-25T16:00:00",ends_at:"2026-09-25T20:00:00",needed:4,KT_locations:{name:"Main Gate"},KT_shift_assignments:[{user_id:"demo"}]},
  {id:"s2",title:"Stage Support",starts_at:"2026-09-25T20:00:00",ends_at:"2026-09-26T00:00:00",needed:3,KT_locations:{name:"Main Floor"},KT_shift_assignments:[]},
  {id:"s3",title:"Awareness",starts_at:"2026-09-26T00:00:00",ends_at:"2026-09-26T04:00:00",needed:2,KT_locations:{name:"Awareness Point"},KT_shift_assignments:[]}
 ],
 artists:[{id:"a1",name:"DJ Beispiel",genre:"Techno"},{id:"a2",name:"Kollektiv Nacht",genre:"Hardgroove"}],
 timetable:[
  {id:"t1",starts_at:"2026-09-25T22:00:00",ends_at:"2026-09-26T00:00:00",KT_artists:{name:"DJ Beispiel"},KT_locations:{name:"Main Floor"}},
  {id:"t2",starts_at:"2026-09-26T00:00:00",ends_at:"2026-09-26T02:00:00",KT_artists:{name:"Kollektiv Nacht"},KT_locations:{name:"Main Floor"}}
 ],
 locations:[{id:"l1",name:"Main Floor",description:"Hauptbühne"},{id:"l2",name:"Backstage",description:"Nur Crew & Artists"},{id:"l3",name:"Awareness Point",description:"Anlaufstelle"}],
 contacts:[{id:"c1",name:"Festivalleitung",role:"Leitung",phone:"+49 …"},{id:"c2",name:"Awareness",role:"Awareness",phone:"+49 …"}],
 emergency:[{id:"e1",title:"Notruf",body:"112"},{id:"e2",title:"Treffpunkt Crew",body:"Backstage / Crew Container"}]
}

export default function Festival(){
 const{demo:demoMode,user}=useAuth(); const[tab,setTab]=useState("shifts")
 const[shifts,setShifts]=useState<any[]>(demo.shifts),[artists,setArtists]=useState<any[]>(demo.artists),[tt,setTt]=useState<any[]>(demo.timetable)
 const[locations,setLocations]=useState<any[]>(demo.locations),[contacts,setContacts]=useState<any[]>(demo.contacts),[emergency,setEmergency]=useState<any[]>(demo.emergency)
 useEffect(()=>{if(demoMode)return;Promise.all([listShifts(),listArtists(),listTimetable(),listLocations(),listCrewContacts(),listEmergencyInfo()]).then(([s,a,t,l,c,e])=>{setShifts(s.data||[]);setArtists(a.data||[]);setTt(t.data||[]);setLocations(l.data||[]);setContacts(c.data||[]);setEmergency(e.data||[])})},[demoMode])
 const uid=user?.id||"demo"
 async function toggleShift(s:any){const mine=s.KT_shift_assignments?.some((x:any)=>x.user_id===uid);if(!demoMode){mine?await leaveShift(s.id,uid):await takeShift(s.id,uid)}setShifts(x=>x.map(y=>y.id===s.id?{...y,KT_shift_assignments:mine?(y.KT_shift_assignments||[]).filter((a:any)=>a.user_id!==uid):[...(y.KT_shift_assignments||[]),{user_id:uid,status:"confirmed"}]}:y))}
 const tabs=[["shifts","Schichten"],["timetable","Timetable"],["artists","Artists"],["locations","Gelände"],["contacts","Kontakte"],["emergency","Notfall"]]
 return <section className="page"><div className="titleRow"><div><span className="eyebrow">KLANGTHERAPIE · FESTIVAL</span><h1>Festival Hub</h1><p>Alles Wichtige für Crew und Festivalbetrieb an einem Ort.</p></div></div><div className="festivalTabs">{tabs.map(([id,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>{label}</button>)}</div>
 {tab==="shifts"&&<div className="festivalGrid">{shifts.map(s=>{const mine=s.KT_shift_assignments?.some((x:any)=>x.user_id===uid);return <article className="festivalCard glass" key={s.id}><div className="iconBubble"><Users/></div><div><span className="eyebrow">{s.KT_locations?.name||"Location"}</span><h3>{s.title}</h3><p><Clock size={14}/>{new Date(s.starts_at).toLocaleString("de-DE",{weekday:"short",hour:"2-digit",minute:"2-digit"})} – {new Date(s.ends_at).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</p><small>{s.KT_shift_assignments?.length||0} / {s.needed||"?"} besetzt</small></div><button className={mine?"secondary":"primary"} onClick={()=>toggleShift(s)}>{mine?"Austragen":"Schicht übernehmen"}</button></article>})}</div>}
 {tab==="timetable"&&<div className="timeline">{tt.map(x=><article className="timelineRow glass" key={x.id}><b>{new Date(x.starts_at).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</b><div><span className="eyebrow">{x.KT_locations?.name}</span><h3>{x.KT_artists?.name||"Artist"}</h3></div><Music2/></article>)}</div>}
 {tab==="artists"&&<div className="festivalGrid">{artists.map(a=><article className="festivalCard glass" key={a.id}><div className="iconBubble"><Music2/></div><div><h3>{a.name}</h3><p>{a.genre||"Artist"}</p></div></article>)}</div>}
 {tab==="locations"&&<div className="festivalGrid">{locations.map(l=><article className="festivalCard glass" key={l.id}><div className="iconBubble"><MapPin/></div><div><h3>{l.name}</h3><p>{l.description}</p></div></article>)}</div>}
 {tab==="contacts"&&<div className="festivalGrid">{contacts.map(c=><article className="festivalCard glass" key={c.id}><div className="iconBubble"><Phone/></div><div><span className="eyebrow">{c.role}</span><h3>{c.name}</h3><p>{c.phone}</p></div></article>)}</div>}
 {tab==="emergency"&&<div className="festivalGrid">{emergency.map(e=><article className="festivalCard emergency glass" key={e.id}><div className="iconBubble"><ShieldAlert/></div><div><h3>{e.title}</h3><p>{e.body}</p></div></article>)}</div>}
 </section>
}