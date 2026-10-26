export const stages = [
  { id: 'new', label: 'Nouveau', tone: 'border-muted-foreground', icon: 'new' },
  { id: 'contacted', label: 'Contacté', tone: 'border-info', icon: 'phone' },
  { id: 'interested', label: 'Intéressé', tone: 'border-primary', icon: 'chat' },
  { id: 'converted', label: 'Converti', tone: 'border-success', icon: 'check' },
  { id: 'lost', label: 'Perdu', tone: 'border-destructive', icon: 'lost' },
] as const;
export type Stage = typeof stages[number]['id'];
export type Prospect = { id: string; owner_id: string; name: string; phone: string; product_id: string | null; product_name: string; source: string; status: Stage; notes: string; call_notes: string; loss_reason: string | null; assigned_to: string | null; reminder_at: string | null; reminder_note: string; last_contact_at: string | null; created_at: string; updated_at: string };
export type Member = { id: string; owner_id: string; user_id: string | null; name: string; phone: string; permission: 'view' | 'edit' | 'manage'; active: boolean; created_at: string };
export type Activity = { id: string; message: string; created_at: string };
export const sources = ['Facebook / Instagram','WhatsApp','Bouche à oreille','TikTok','Publicité','Autre'];
export const reasons = ['Trop cher','A acheté ailleurs','Pas convaincu','Pas de réponse','Autre'];
export function whatsappUrl(name: string, phone: string, product: string) {
 return `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Bonjour ${name} 👋, je vous recontacte concernant le ${product || 'produit'} que vous aviez regardé. Est-ce que vous êtes toujours intéressé(e) ? 😊`)}`;
}
export function isDue(date: string | null, now = new Date()) { return !!date && new Date(date).getTime() <= new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).getTime()-1; }
export function closingStats(rows: Prospect[], now = new Date()) {
 const converted=rows.filter(p=>p.status==='converted').length;
 return { total:rows.length, converted, rate:rows.length? Math.round(converted/rows.length*100):0, ongoing:rows.filter(p=>['contacted','interested'].includes(p.status)).length, lost:rows.filter(p=>p.status==='lost').length, due:rows.filter(p=>!['lost','converted'].includes(p.status)&&isDue(p.reminder_at,now)).length };
}
export function demoData() {
 const now=new Date(); const date=(days:number,hour:number)=>new Date(now.getFullYear(),now.getMonth(),now.getDate()+days,hour).toISOString();
 const members: Member[]=[{id:'demo-adjoua',owner_id:'demo',user_id:null,name:'Adjoua K.',phone:'+22507456789',permission:'edit',active:true,created_at:now.toISOString()},{id:'demo-nadia',owner_id:'demo',user_id:null,name:'Nadia M.',phone:'+22997234567',permission:'edit',active:true,created_at:now.toISOString()}];
 const entries=[['Kofi Mensah','+22997123456','Casque Bluetooth','Intéressé mais veut réfléchir','new'],['Aminata S.','+22507894523','T-shirt Premium','Vue le produit sur Facebook','new'],['Jean-Pierre K.','+22890345678','Sac à dos','A demandé le prix, pas encore répondu','contacted'],['Fatou D.','+22177234567','Montre Fashion','Veut voir plus de photos','contacted'],['Moussa T.','+22670456789','Casque Bluetooth','Prêt à commander, attend confirmation stock','interested'],['Awa B.','+23769123456','T-shirt Premium','Veut livraison rapide','interested'],['Ibrahim S.','+22996789012','Sac à dos','Commande confirmée ✓','converted'],['Marie K.','+22505678901','Montre Fashion','A acheté ailleurs','lost']];
 const prospects: Prospect[]=entries.map((e,i)=>({id:`demo-${i}`,owner_id:'demo',name:e[0],phone:e[1],product_id:null,product_name:e[2],notes:e[3],call_notes:'',status:e[4] as Stage,source:sources[i%sources.length],loss_reason:i===7?'A acheté ailleurs':null,assigned_to:members[i%2].id,reminder_at:[0,3,4,5].includes(i)?date(i<4?0:1,i===3?16:14):null,reminder_note:'',last_contact_at:date(-1,11),created_at:date(-2,9),updated_at:date(-1,11)}));
 return { prospects,members,activities:[{id:'demo-event',message:'Ibrahim S. → Converti',created_at:date(0,9)}],products:[{id:'demo-product-1',name:'Casque Bluetooth'},{id:'demo-product-2',name:'T-shirt Premium'},{id:'demo-product-3',name:'Sac à dos'},{id:'demo-product-4',name:'Montre Fashion'}] };
}
