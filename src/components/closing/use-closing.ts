import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { demoData, type Prospect, type Member } from '@/lib/closing-model';
import { getClosingWorkspace, saveClosingProspect, deleteClosingProspect, saveClosingMember, removeClosingMember } from '@/lib/closing.functions';
export function useClosing(ownerId?: string) {
 const {user,loading:authLoading}=useAuth();
 const [demo,setDemo]=useState(false);
 const [sample,setSample]=useState(()=>demoData());
 const [busy,setBusy]=useState(false);
 const queryClient=useQueryClient();
 const fetchWorkspace=useServerFn(getClosingWorkspace);
 const saveProspectFn=useServerFn(saveClosingProspect);const deleteFn=useServerFn(deleteClosingProspect);const memberFn=useServerFn(saveClosingMember);const removeFn=useServerFn(removeClosingMember);
 const query=useQuery({queryKey:['closing',user?.id,ownerId],queryFn:()=>fetchWorkspace({data:{ownerId}}),enabled:!!user&&!demo});
 const data=demo?{...sample,ownerId:'demo',permission:'manage',memberships:[]}:query.data;
 const rows=(data?.prospects??[]) as Prospect[];const members=(data?.members??[]) as Member[];
 const refresh=()=>queryClient.invalidateQueries({queryKey:['closing']});
 const addLog=(message:string)=>setSample(s=>({...s,activities:[{id:crypto.randomUUID(),message,created_at:new Date().toISOString()},...s.activities]}));
 const save=async(p:Partial<Prospect>&{name:string;phone:string})=>{
 setBusy(true); try {
 const fields={name:p.name,phone:p.phone,product_id:p.product_id??null,product_name:p.product_name??'',source:p.source??'Autre',status:p.status??'new',notes:p.notes??'',loss_reason:p.loss_reason??null,assigned_to:p.assigned_to??null,reminder_at:p.reminder_at??null,reminder_note:p.reminder_note??''};
 if(demo){const entry={...fields,id:p.id??crypto.randomUUID(),owner_id:'demo',created_at:p.created_at??new Date().toISOString(),updated_at:new Date().toISOString(),last_contact_at:p.last_contact_at??null} as Prospect;setSample(s=>({...s,prospects:p.id?s.prospects.map(r=>r.id===p.id?entry:r):[entry,...s.prospects]}));addLog(`${p.id?'Prospect modifié':'Nouveau prospect'} : ${p.name}`);}
 else {if(!data)throw new Error('Connectez-vous pour enregistrer');await saveProspectFn({data:{...fields,status:fields.status,source:fields.source as 'Autre',loss_reason:fields.loss_reason as 'Autre'|null,id:p.id,ownerId:data.ownerId}});await refresh();}
 toast.success(demo?'Exemple enregistré':'Prospect enregistré');return true;
 }catch(e){toast.error(e instanceof Error?e.message:'Enregistrement impossible');return false;}finally{setBusy(false);}
 };
 const remove=async(p:Prospect)=>{setBusy(true);try{if(demo){setSample(s=>({...s,prospects:s.prospects.filter(r=>r.id!==p.id)}));addLog(`Prospect supprimé : ${p.name}`);}else{if(!data) return;await deleteFn({data:{id:p.id,ownerId:data.ownerId}});await refresh();}toast.success('Prospect supprimé');}catch(e){toast.error(e instanceof Error?e.message:'Suppression refusée');}finally{setBusy(false);}};
 const invite=async(fields:{name:string;phone:string;permission:'view'|'edit'|'manage'})=>{setBusy(true);try{if(demo){const m={...fields,id:crypto.randomUUID(),owner_id:'demo',user_id:null,active:true,created_at:new Date().toISOString()};setSample(s=>({...s,members:[...s.members,m]}));return {token:'demo',member:m};}if(!data)throw new Error('Connectez-vous pour inviter');const result=await memberFn({data:{...fields,ownerId:data.ownerId}});await refresh();return result;}catch(e){toast.error(e instanceof Error?e.message:'Invitation impossible');return null;}finally{setBusy(false);}};
 const removeMember=async(m:Member)=>{setBusy(true);try{if(demo)setSample(s=>({...s,members:s.members.map(x=>x.id===m.id?{...x,active:false}:x)}));else{if(!data)return;await removeFn({data:{id:m.id,ownerId:data.ownerId}});await refresh();}toast.success('Accès du membre suspendu');}catch(e){toast.error(e instanceof Error?e.message:'Modification impossible');}finally{setBusy(false);}};
 return {user,authLoading,demo,setDemo,busy,data,rows,members,save,remove,invite,removeMember,loading:authLoading||(!demo&&!!user&&query.isPending),error:query.error,canEdit:data?.permission!=='view'&&!!data,canManage:data?.permission==='manage',refresh};
}
export type ClosingState=ReturnType<typeof useClosing>;
