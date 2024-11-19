import type { MetaFunction } from '@remix-run/node'

import { AuctionCard } from '~/components/auction/AuctionCard'

import { useActiveAuctions } from '~/components/wagmi/hooks'
import { useTranslation } from 'react-i18next'

export const meta: MetaFunction = () => {
    return [
        { title: '0xHeroes' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function Index() {
    const { activeAuctions } = useActiveAuctions()
    const { t } = useTranslation()

    return (
        <>
            <h1>{t('title')}</h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeAuctions?.map((auctionId, index) => (
                    <AuctionCard auctionId={auctionId} key={index} />
                ))}
            </div>
        </>
    )
}
