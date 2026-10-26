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
