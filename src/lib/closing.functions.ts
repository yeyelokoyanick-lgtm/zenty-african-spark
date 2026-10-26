import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { GatewayError, generateResponse } from '@lovable.dev/ai-gateway';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { buildCallPrompt, extractResponseText, parseAdvice } from '@/lib/closing-ai';
const ownerSchema=z.object({ownerId:z.string().uuid().optional()});
const phone=z.string().regex(/^\+[1-9]\d{7,14}$/, 'Numéro international requis, ex. +229…');
const prospectSchema=z.object({id:z.string().uuid().optional(),ownerId:z.string().uuid(),name:z.string().trim().min(1).max(160),phone,product_id:z.string().uuid().nullable(),product_name:z.string().max(200),source:z.enum(['Facebook / Instagram','WhatsApp','Bouche à oreille','TikTok','Publicité','Autre']),status:z.enum(['new','contacted','interested','converted','lost']),notes:z.string().max(4000),loss_reason:z.enum(['Trop cher','A acheté ailleurs','Pas convaincu','Pas de réponse','Autre']).nullable(),assigned_to:z.string().uuid().nullable(),reminder_at:z.string().datetime().nullable(),reminder_note:z.string().max(1000)});
export const getClosingWorkspace=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>ownerSchema.parse(i)).handler(async({context,data})=>{
 const ownerId=data.ownerId??context.userId;
 const {data:allowed,error:accessError}=await context.supabase.rpc('can_access_closing',{_owner:ownerId,_action:'view'});
 if(accessError||!allowed) throw new Error('Accès à cet espace refusé');
 const [p,m,a,products,memberships]=await Promise.all([
 context.supabase.from('closing_prospects').select('*').eq('owner_id',ownerId).order('created_at',{ascending:false}),
 context.supabase.from('closing_team_members').select('*').eq('owner_id',ownerId).order('name'),
 context.supabase.from('closing_activity').select('id,message,created_at').eq('owner_id',ownerId).order('created_at',{ascending:false}).limit(50),
 context.supabase.from('products').select('id,name').eq('user_id',ownerId),
 context.supabase.from('closing_team_members').select('owner_id,name,permission').eq('user_id',context.userId).eq('active',true)]);
 for(const result of [p,m,a,products,memberships]) if(result.error) throw new Error('Chargement du closing impossible');
 const membership=m.data?.find(x=>x.user_id===context.userId);
 return {ownerId,permission:ownerId===context.userId?'manage':membership?.permission??'view',prospects:p.data??[],members:m.data??[],activities:a.data??[],products:products.data??[],memberships:memberships.data??[]};
});
export const saveClosingProspect=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>prospectSchema.parse(i)).handler(async({context,data})=>{
 const {id,ownerId,...fields}=data;
 const query=id?context.supabase.from('closing_prospects').update(fields).eq('id',id).eq('owner_id',ownerId):context.supabase.from('closing_prospects').insert({...fields,owner_id:ownerId});
 const {data:row,error}=await query.select('*').single();
 if(error) throw new Error('Enregistrement refusé ou données invalides');
 return row;
});
export const deleteClosingProspect=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({id:z.string().uuid(),ownerId:z.string().uuid()}).parse(i)).handler(async({context,data})=>{
 const {data:rows,error}=await context.supabase.from('closing_prospects').delete().eq('id',data.id).eq('owner_id',data.ownerId).select('id');
 if(error||!rows?.length) throw new Error('Suppression refusée'); return {ok:true};
});
export const saveClosingMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({ownerId:z.string().uuid(),name:z.string().trim().min(1).max(100),phone,permission:z.enum(['view','edit','manage'])}).parse(i)).handler(async({context,data})=>{
 const {ownerId,...fields}=data;
 const {data:member,error}=await context.supabase.from('closing_team_members').insert({...fields,owner_id:ownerId}).select('*').single();
 if(error) throw new Error('Ajout à l’équipe refusé');
 const {data:invitation,error:invError}=await context.supabase.from('closing_invitations').insert({owner_id:ownerId,member_id:member.id}).select('token').single();
 if(invError) throw new Error('Membre enregistré, invitation indisponible');
 return {member,token:invitation.token};
});
export const removeClosingMember=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({id:z.string().uuid(),ownerId:z.string().uuid()}).parse(i)).handler(async({context,data})=>{
 const {data:rows,error}=await context.supabase.from('closing_team_members').update({active:false}).eq('id',data.id).eq('owner_id',data.ownerId).select('id');
 if(error||!rows?.length) throw new Error('Modification refusée'); return {ok:true};
});
export const acceptClosingInvitation=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>z.object({token:z.string().min(40).max(100)}).parse(i)).handler(async({context,data})=>{
 const {data:ownerId,error}=await context.supabase.rpc('accept_closing_invitation',{_token:data.token});
 if(error) throw new Error('Invitation expirée ou déjà utilisée'); return {ownerId};
});
const callNoteSchema=z.object({ownerId:z.string().uuid(),prospectId:z.string().uuid(),outcome:z.enum(['reached','voicemail','no_answer','busy']),note:z.string().trim().min(3).max(2000),closerName:z.string().trim().max(100).default('')});
export const generateClosingAdvice=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((i:unknown)=>callNoteSchema.parse(i)).handler(async({context,data})=>{
 const {data:allowed,error:accessError}=await context.supabase.rpc('can_access_closing',{_owner:data.ownerId,_action:'edit'});
 if(accessError||!allowed) throw new Error('Accès à cet espace refusé');
 const {data:prospect,error:prospectError}=await context.supabase.from('closing_prospects').select('id,name,product_name,status,notes,call_notes').eq('id',data.prospectId).eq('owner_id',data.ownerId).single();
 if(prospectError||!prospect) throw new Error('Prospect introuvable');
 let advice;
 try{
  const response=await generateResponse({model:'openai/gpt-6-astra',input:buildCallPrompt({prospectName:prospect.name,productName:prospect.product_name??'',status:prospect.status,previousNotes:[prospect.call_notes,prospect.notes].filter(Boolean).join('\n'),outcome:data.outcome,note:data.note,closerName:data.closerName})});
  advice=parseAdvice(extractResponseText(response));
 }catch(error){
  if(error instanceof GatewayError) throw new Error('L’assistant IA est momentanément indisponible, réessayez dans un instant');
  throw new Error('Analyse de la note impossible, réessayez');
 }
 const stamp=new Date().toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 const entry=`[${stamp}] ${data.closerName||'Closer'} — ${data.note}`;
 const merged=[prospect.call_notes,entry].filter(Boolean).join('\n').slice(-4000);
 const {error:updateError}=await context.supabase.from('closing_prospects').update({call_notes:merged,last_contact_at:new Date().toISOString()}).eq('id',data.prospectId).eq('owner_id',data.ownerId);
 if(updateError) throw new Error('Note enregistrée mais journal indisponible');
 await context.supabase.rpc('log_closing_activity',{_owner:data.ownerId,_message:`Note d’appel — ${prospect.name} : ${data.note.slice(0,120)}`});
 return {advice,prospectId:data.prospectId};
});
