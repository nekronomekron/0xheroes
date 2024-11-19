import { useEffect, useState } from 'react'
import type { MetaFunction } from '@remix-run/node'

import { ProposalList } from '~/components/dao/ProposalList'
import { TreasuryCard } from '~/components/treasury/TreasuryCard'
import { VotesCard } from '~/components/votes/VotesCard'

export const meta: MetaFunction = () => {
    return [
        { title: '0xHeroes - DAO' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function DaoPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TreasuryCard />
            <VotesCard />
            <ProposalList className="md:col-span-2" />
        </div>
    )
}
