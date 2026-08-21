let subject="역사",level="하",facts=[],questions=[],qi=0,score=0,runXP=0,answer="";
const $=id=>document.getElementById(id);
const screens=["home","study","difficulty","quiz","result"];
function show(name){screens.forEach(x=>$(x).classList.toggle("hidden",x!==name))}
function clean(s){return s.replace(/\s+/g," ").trim()}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function saveXP(){let total=Number(localStorage.getItem("chunsikXP")||0);total+=runXP;localStorage.setItem("chunsikXP",total);$("xp").textContent=total}
$("xp").textContent=localStorage.getItem("chunsikXP")||0;

document.querySelectorAll(".subject").forEach(b=>b.onclick=()=>{document.querySelectorAll(".subject").forEach(x=>x.classList.remove("active"));b.classList.add("active");subject=b.dataset.subject});
document.querySelectorAll(".difficulty").forEach(b=>b.onclick=()=>{document.querySelectorAll(".difficulty").forEach(x=>x.classList.remove("active"));b.classList.add("active");level=b.dataset.level});

$("photo").onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 $("preview").src=URL.createObjectURL(file);$("preview").style.display="block";
 const st=$("ocrStatus");st.className="status";st.textContent="🔎 사진 속 글자를 읽는 중...";
 try{
   if(!window.Tesseract)throw Error();
   const r=await Tesseract.recognize(file,"kor+eng",{logger:m=>{if(m.status==="recognizing text")st.textContent=`🔎 글자를 읽는 중... ${Math.round((m.progress||0)*100)}%`}});
   const text=clean(r.data.text||"");
   if(text.length<3){st.className="status warn";st.textContent="⚠️ 글자를 잘 읽지 못했어. 더 선명한 사진을 찍거나 직접 입력해줘."}
   else{$("notes").value=text;st.textContent="✅ 글자를 읽었어! 내용을 확인한 뒤 공부자료 만들기를 눌러줘."}
 }catch{st.className="status warn";st.textContent="⚠️ 사진 읽기에 실패했어. 인터넷 연결을 확인하거나 직접 입력해줘."}
};

$("makeStudy").onclick=()=>{
 const text=clean($("notes").value);
 if(text.length<3){alert("공부 내용을 넣어줘!");return}
 facts=text.split(/[\n.!?。！？]+/).map(clean).filter(x=>x.length>=3);
 if(!facts.length)facts=[text];
 $("subjectTag").textContent=subject;
 $("summary").textContent=facts.slice(0,2).join(". ")+(facts.length>2?" …":"");
 $("points").innerHTML=facts.slice(0,8).map((x,i)=>`<li><b>${i+1}.</b> ${x}</li>`).join("");
 show("study");
};
$("toDifficulty").onclick=()=>show("difficulty");
$("startQuiz").onclick=()=>{buildQuestions();qi=0;score=0;runXP=0;show("quiz");render()};
function buildQuestions(){
 questions=[];
 for(let i=0;i<6;i++){
  const f=facts[i%facts.length],words=f.split(/\s+/).filter(x=>x.length>=2);
  if(i%3===0&&words.length){const target=words[Math.min(Math.floor(words.length/2),words.length-1)];questions.push({text:"빈칸에 들어갈 가장 알맞은 말은?\n"+f.replace(target,"_____"),ans:target});}
  else questions.push({text:(i%3===1?"다음 내용과 가장 관련 있는 것은?":"학습한 내용 중 알맞은 것은?")+"\n"+f,ans:f});
 }
}
function render(){
 const q=questions[qi];answer=q.ans;$("quizTag").textContent=subject+" · "+level;$("qnum").textContent=qi+1;$("bar").style.width=(qi/6*100)+"%";$("question").textContent=q.text;$("feedback").textContent="";$("next").classList.add("hidden");$("choices").innerHTML="";
 let pool=q.text.includes("_____")?[q.ans,"핵심 개념","중요한 내용","관련 개념"]:[q.ans,...facts.filter(x=>x!==q.ans)];
 shuffle(pool).slice(0,4).forEach(c=>{let b=document.createElement("button");b.className="choice";b.type="button";b.textContent=c;b.onclick=()=>pick(b,c);$("choices").appendChild(b)});
}
function pick(btn,c){
 document.querySelectorAll(".choice").forEach(b=>b.disabled=true);
 if(c===answer){btn.classList.add("correct");score++;runXP=runXP+(level==="하"?10:level==="중"?15:20);$("feedback").textContent="✅ 정답! XP 획득!"}
 else{btn.classList.add("wrong");$("feedback").textContent="❌ 아쉽다. 정답을 다시 기억해보자."}
 $("next").classList.remove("hidden");
}
$("next").onclick=()=>{qi++;if(qi>=6)finish();else render()};
function finish(){$("bar").style.width="100%";saveXP();$("resultText").textContent=`6문제 중 ${score}문제 정답 · ⭐ ${runXP} XP 획득 · ${level} 난이도`;show("result")}
$("retry").onclick=()=>{qi=0;score=0;runXP=0;show("quiz");render()};
$("newStudy").onclick=()=>location.reload();
