import { createFileRoute } from '@tanstack/react-router';
import { ClosingPage } from './closing';
import { z } from 'zod';
export const Route=createFileRoute('/closing/')({validateSearch:z.object({owner:z.string().uuid().optional()}),head:()=>({meta:[{title:'Espace Closing — AFRISELL'},{name:'description',content:'Gérez vos prospects, votre équipe de closing et vos relances sur AFRISELL.'},{property:'og:title',content:'Espace Closing — AFRISELL'},{property:'og:description',content:'Prospects, closing et relances de votre activité e-commerce.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Page});
function Page(){const {owner}=Route.useSearch();return <ClosingPage ownerId={owner}/>;}
