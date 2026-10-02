import { Suspense } from 'react';
import { AssistantWorkspace } from '@/components/dashboard/assistant-workspace';

export default function AIWorkspacePage(){
  return <Suspense fallback={<div className="grid min-h-[calc(100svh-4rem)] place-items-center text-xs text-zinc-700">Opening AI Workspace…</div>}>
    <AssistantWorkspace/>
  </Suspense>;
}
