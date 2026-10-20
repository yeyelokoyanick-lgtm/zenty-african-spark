import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import postgres from 'postgres';

const dbUrl = process.env['SUPABASE_DB_URL'];
if (!dbUrl) throw new Error('SUPABASE_DB_URL is required for database integration tests');
const sql = postgres(dbUrl, { max: 1, prepare: false });
let definition;

beforeAll(async () => {
  const rows = await sql`select pg_get_functiondef('public.has_service_network_access()'::regprocedure) as definition`;
  definition = rows[0].definition;
});
afterAll(async () => { await sql.end(); });

// Evaluate the installed entitlement function against isolated transaction-local records,
// without creating auth users or changing real subscriptions/payments.
async function eligibility(patch = {}) {
  return sql.begin(async tx => {
    await tx`create temporary table fixture_subscriptions (id uuid,user_id uuid,plan_id uuid,status text,cancelled_at timestamptz,price numeric,current_period_start timestamptz,current_period_end timestamptz) on commit drop`;
    await tx`create temporary table fixture_plans (id uuid,monthly_price numeric) on commit drop`;
    await tx`create temporary table fixture_payments (subscription_id uuid,user_id uuid,server_confirmed boolean,status text,paid_at timestamptz,created_at timestamptz) on commit drop`;
    const user='b1000000-0000-4000-8000-000000000001';
    const sub='b1000000-0000-4000-8000-000000000002';
    const plan='b1000000-0000-4000-8000-000000000003';
    const fixture = { status:'active', price:5000, planPrice:5000, end:new Date(Date.now()+86400000), cancelled:null, confirmed:true, paymentStatus:'successful', paidAt:new Date(), ...patch };
    await tx`insert into fixture_plans values(${plan},${fixture.planPrice})`;
    await tx`insert into fixture_subscriptions values(${sub},${user},${plan},${fixture.status},${fixture.cancelled},${fixture.price},now()-interval '1 day',${fixture.end})`;
    await tx`insert into fixture_payments values(${sub},${user},${fixture.confirmed},${fixture.paymentStatus},${fixture.paidAt},now())`;
    const query = definition.slice(definition.indexOf(' SELECT EXISTS'),definition.lastIndexOf('$function$')).trim().replace(/;\s*$/, '')
      .replaceAll('public.subscriptions','fixture_subscriptions').replaceAll('public.subscription_plans','fixture_plans').replaceAll('public.subscription_payments','fixture_payments').replaceAll('auth.uid()',`'${user}'::uuid`);
    const result = await tx.unsafe(query);
    return result[0].exists;
  });
}

describe('Installed subscription entitlement rules', () => {
  test('free offer cannot read private contacts',async()=>expect(await eligibility({price:0,planPrice:0})).toBe(false));
  test('active paid offer with server-confirmed payment can read contacts',async()=>expect(await eligibility()).toBe(true));
  test('expired period cannot read contacts even with active status',async()=>expect(await eligibility({end:new Date(Date.now()-86400000)})).toBe(false));
  test('expired subscription status cannot read contacts',async()=>expect(await eligibility({status:'expired'})).toBe(false));
  test('cancelled subscription cannot read contacts',async()=>expect(await eligibility({status:'cancelled',cancelled:new Date()})).toBe(false));
  test('pending payment does not activate premium',async()=>expect(await eligibility({confirmed:false,paymentStatus:'pending',paidAt:null})).toBe(false));
  test('unconfirmed successful browser payment does not activate premium',async()=>expect(await eligibility({confirmed:false})).toBe(false));
  test('failed renewal suspends premium',async()=>expect(await eligibility({paymentStatus:'failed'})).toBe(false));
  test('past-due subscription cannot read contacts',async()=>expect(await eligibility({status:'past_due'})).toBe(false));
});

test('free users cannot forge subscriptions or payment confirmations',async()=>{
  const grants=await sql`select has_table_privilege('authenticated','public.subscriptions','UPDATE') as can_forge_subscription,has_table_privilege('authenticated','public.subscription_payments','INSERT') as can_forge_payment,has_function_privilege('authenticated','public.confirm_service_subscription_payment(uuid)','EXECUTE') as can_confirm`;
  expect(grants[0].can_forge_subscription).toBe(false);
  expect(grants[0].can_forge_payment).toBe(false);
  expect(grants[0].can_confirm).toBe(false);
});

test('all installed contact read policies require paid eligibility and verified providers',async()=>{
 const rows=await sql`select qual from pg_policies where schemaname='public' and tablename='service_provider_contacts' and cmd in ('SELECT','ALL')`;
 expect(rows.length).toBe(1);
 expect(rows[0].qual).toContain('has_service_network_access()');
 expect(rows[0].qual).toContain('p.verified');
 const tables=await sql`select relrowsecurity from pg_class where oid='public.service_provider_contacts'::regclass`;
 expect(tables[0].relrowsecurity).toBe(true);
});

test('anonymous users have no private contact grant',async()=>{
 const rows=await sql`select has_table_privilege('anon','public.service_provider_contacts','SELECT') as allowed`;
 expect(rows[0].allowed).toBe(false);
});
