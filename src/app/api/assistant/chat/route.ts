import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema=z.object({
  message:z.string().min(1).max(12000),
  model:z.string().min(1).max(120).optional()
});

const DEFAULT_MODELS=[
  'z-ai/glm-5.3-flash',
  'z-ai/glm-5.3',
  'nvidia/nemotron-3-super-120b-a12b',
  'openai/gpt-oss-20b'
];

function localFallback(message:string,reason:'missing-key'|'model-error'){
  const m=message.trim().toLowerCase();

  if(reason==='missing-key'){
    if(/^(hi|hii+|hello|hey|hey bro|hello bro|namaste|yo)[!. ]*$/.test(m)){
      return 'Hey 👋 Scoryn ready hai. NVIDIA server key production deployment mein available nahi hai.';
    }
    return 'NVIDIA server key production deployment mein available nahi hai. Vercel mein NVIDIA_API_KEY ko Production environment ke liye enable karke redeploy karo.';
  }

  if(/^(hi|hii+|hello|hey|hey bro|hello bro|namaste|yo)[!. ]*$/.test(m)){
    return 'Hey 👋 Scoryn ready hai. NVIDIA endpoint abhi response nahi de raha; thodi der baad phir try karo.';
  }

  return 'NVIDIA API key mil gayi hai, lekin available NVIDIA endpoints ne request complete nahi ki. Scoryn fallback mode mein hai; thodi der baad retry karo.';
}

async function callModel(model:string,message:string,key:string){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);

  try{
    const res=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
      method:'POST',
      signal:controller.signal,
      headers:{
        accept:'application/json',
        'content-type':'application/json',
        authorization:`Bearer ${key}`
      },
      body:JSON.stringify({
        model,
        temperature:.4,
        top_p:.9,
        max_tokens:800,
        stream:false,
        messages:[
          {
            role:'system',
            content:'You are Scoryn, a concise AI copilot for web developers and freelancers. Answer normal questions naturally. When discussing website audits, explain technical issues in business-friendly language. Never invent statistics, revenue loss, or unsupported claims.'
          },
          {role:'user',content:message}
        ]
      })
    });

    if(!res.ok){
      const detail=(await res.text()).slice(0,500);
      throw new Error(`${model} failed with ${res.status}: ${detail}`);
    }

    const data:any=await res.json();
    const text=data?.choices?.[0]?.message?.content?.trim();
    if(!text) throw new Error(`${model} returned no text`);
    return text;
  }finally{
    clearTimeout(timeout);
  }
}

export async function GET(req:Request){
  const key=process.env.NVIDIA_API_KEY;
  const url=new URL(req.url);
  const probe=url.searchParams.get('probe')==='1';

  if(!probe){
    return NextResponse.json({
      configured:Boolean(key),
      primaryModel:DEFAULT_MODELS[0]
    });
  }

  if(!key){
    return NextResponse.json({configured:false,ok:false,error:'missing-key'});
  }

  const failures:string[]=[];
  for(const model of DEFAULT_MODELS){
    try{
      const reply=await callModel(model,'Reply with exactly: OK',key);
      return NextResponse.json({configured:true,ok:true,model,reply});
    }catch(e){
      failures.push(e instanceof Error?e.message:String(e));
    }
  }

  return NextResponse.json({configured:true,ok:false,failures},{status:502});
}

export async function POST(req:Request){
  try{
    const {message,model}=bodySchema.parse(await req.json());
    const key=process.env.NVIDIA_API_KEY;

    if(!key){
      return NextResponse.json({
        reply:localFallback(message,'missing-key'),
        model:'local-fallback',
        fallback:true,
        configured:false
      });
    }

    const order=[model,...DEFAULT_MODELS].filter((x,i,a)=>Boolean(x)&&a.indexOf(x)===i) as string[];
    let lastError='No NVIDIA model succeeded.';

    for(const candidate of order){
      try{
        const reply=await callModel(candidate,message,key);
        return NextResponse.json({
          reply,
          model:candidate,
          fallback:candidate!==model,
          configured:true
        });
      }catch(e){
        lastError=e instanceof Error?e.message:lastError;
        console.error('[Scoryn NVIDIA]',lastError);
      }
    }

    return NextResponse.json({
      reply:localFallback(message,'model-error'),
      model:'local-fallback',
      fallback:true,
      configured:true,
      warning:lastError
    });
  }catch(e){
    return NextResponse.json({
      error:e instanceof Error?e.message:'Invalid chat request.'
    },{status:400});
  }
}
