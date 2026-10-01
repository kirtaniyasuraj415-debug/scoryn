import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema=z.object({
  message:z.string().min(1).max(12000),
  model:z.string().min(1).max(120).optional()
});

const DEFAULT_MODELS=[
  'meta/llama-3.2-1b-instruct',
  'meta/llama-3.1-8b-instruct',
  'deepseek-ai/deepseek-v4-flash',
  'stepfun-ai/step-3.5-flash',
  'openai/gpt-oss-20b'
];

function localFallback(message:string){
  const m=message.trim().toLowerCase();
  if(/^(hi|hii+|hello|hey|hey bro|hello bro|namaste|yo)[!. ]*$/.test(m)){
    return 'Hey 👋 Scoryn ready hai. Website URL paste karo to audit start hoga, ya koi normal question pucho.';
  }
  if(m.includes('what can you do')||m.includes('kya kar sak')){
    return 'Main website audit workflow, technical issue explanation, client-friendly report copy aur outreach/pitch writing mein help kar sakta hoon. Full general AI answers ke liye NVIDIA server key connect honi chahiye.';
  }
  return 'Scoryn ka chat interface ready hai, lekin live NVIDIA key abhi server par connected nahi hai. Website URL paste karoge to audit flow chalega; NVIDIA key connect hote hi normal questions bhi selected model se answer honge.';
}

async function callModel(model:string,message:string,key:string){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
    const res=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
      method:'POST',
      signal:controller.signal,
      headers:{'content-type':'application/json','authorization':`Bearer ${key}`},
      body:JSON.stringify({
        model,
        temperature:.25,
        max_tokens:700,
        messages:[
          {role:'system',content:'You are Scoryn, a concise AI copilot for web developers and freelancers. Answer normal questions naturally. When discussing website audits, explain technical issues in business-friendly language. Never invent statistics or revenue loss.'},
          {role:'user',content:message}
        ]
      })
    });
    if(!res.ok) throw new Error(`${model} failed with ${res.status}`);
    const data:any=await res.json();
    const text=data?.choices?.[0]?.message?.content?.trim();
    if(!text) throw new Error(`${model} returned no text`);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req:Request){
  try{
    const {message,model}=bodySchema.parse(await req.json());
    const key=process.env.NVIDIA_API_KEY;

    if(!key){
      return NextResponse.json({reply:localFallback(message),model:'local-fallback',fallback:true});
    }

    const order=[model,...DEFAULT_MODELS].filter((x,i,a)=>Boolean(x)&&a.indexOf(x)===i) as string[];
    let lastError='No NVIDIA model succeeded.';

    for(const candidate of order){
      try{
        const reply=await callModel(candidate,message,key);
        return NextResponse.json({reply,model:candidate,fallback:candidate!==model});
      }catch(e){
        lastError=e instanceof Error?e.message:lastError;
      }
    }

    return NextResponse.json({reply:localFallback(message),model:'local-fallback',fallback:true,warning:lastError});
  }catch(e){
    return NextResponse.json({error:e instanceof Error?e.message:'Invalid chat request.'},{status:400});
  }
}
