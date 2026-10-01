"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';
import { AssistantWorkspace } from '@/components/dashboard/assistant-workspace';

export default function Dashboard(){
  const [name,setName]=useState<string|null>(null);

  useEffect(()=>{
    const {auth}=getFirebaseClient();
    return onAuthStateChanged(auth,user=>setName(user?.displayName||null));
  },[]);

  return <AssistantWorkspace displayName={name}/>;
}
