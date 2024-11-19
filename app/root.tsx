import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    isRouteErrorResponse,
    useRouteError,
} from '@remix-run/react'
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import stylesheet from '~/tailwind.css?url'

import { polygon, polygonAmoy, sepolia } from 'wagmi/chains'

import { NextUIProvider } from '@nextui-org/react'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

import { config } from './wagmi.config'

import { useTranslation } from 'react-i18next'
import { withTranslation } from 'react-i18next'

const queryClient = new QueryClient()

export const links: LinksFunction = () => [
    { rel: 'stylesheet', href: stylesheet },
]

// export async function loader({ request }: LoaderFunctionArgs) {
//     let locale = await i18next.getLocale(request)
//     return json({ locale })
// }

export let handle = {
    // In the handle export, we can add a i18n key with namespaces our route
    // will need to load. This key can be a single string or an array of strings.
    // TIP: In most cases, you should set this to your defaultNS from your i18n config
    // or if you did not set one, set it to the i18next default namespace "translation"
    i18n: 'common',
}

export function Layout({ children }: { children: any }) {
    // let { locale } = useLoaderData<typeof loader>()
    let { i18n } = useTranslation()
    // useChangeLanguage(locale)

    return (
        <html dir={i18n.dir()} className="bg-black">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body className="bg-black">
                <NextUIProvider>
                    <WagmiProvider config={config}>
                        <QueryClientProvider client={queryClient}>
                            <RainbowKitProvider initialChain={sepolia}>
                                {children}

                                <ScrollRestoration />
                                <Scripts />
                            </RainbowKitProvider>
                        </QueryClientProvider>
                    </WagmiProvider>
                </NextUIProvider>
            </body>
        </html>
    )
}

function App() {
    return <Outlet />
}

export default withTranslation()(App)

export function ErrorBoundary() {
    const error = useRouteError() as any

    if (isRouteErrorResponse(error)) {
        return (
            <>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </>
        )
    }

    return (
        <>
            <h1>Error!</h1>
            <p>{error?.message ?? 'Unknown error'}</p>
        </>
    )
}
