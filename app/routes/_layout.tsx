import type { MetaFunction } from '@remix-run/node'

import { Navbar } from '~/components/navbar/Navbar'
import { AuctionCard } from '~/components/auction/AuctionCard'

import { useActiveAuctions } from '~/components/wagmi/hooks'
import { Outlet } from '@remix-run/react'
import { Footer } from '~/components/footer/Footer'

export default function DefaultLayout() {
    const { activeAuctions } = useActiveAuctions()

    return (
        <div className="relative flex flex-col">
            <Navbar />

            <div className="main-background">
                <div className="bg-slate-50 container mx-auto max-w-7xl px-6 py-8 md:py-16 shadow-2xl shadow-black">
                    <Outlet />
                </div>
            </div>

            <Footer />
        </div>
    )
}
