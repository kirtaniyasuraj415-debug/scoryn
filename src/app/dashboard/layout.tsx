import { redirect } from 'next/navigation'; import { getServerUser } from '@/lib/auth/session'; import { Sidebar } from '@/components/dashboard/sidebar'; import { MobileNav } from '@/components/dashboard/mobile-nav';
export const dynamic='force-dynamic';
export default async function DashboardLayout({children}:{children:React.ReactNode}){const user=await getServerUser();if(!user)redirect('/login');return <div className="flex min-h-screen bg-[#070707] text-white"><Sidebar/><main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main><MobileNav/></div>}
