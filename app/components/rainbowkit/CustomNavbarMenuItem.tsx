import '@rainbow-me/rainbowkit/styles.css'

import {
    NavbarMenuItem,
    NavbarMenuItemProps,
    Spinner,
    Link,
} from '@nextui-org/react'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { WalletIcon, AlertIcon } from '../icons'
import * as blockies from 'blockies-ts'

type CustomNavbarMenuItemProps = {} & NavbarMenuItemProps

export const CustomNavbarMenuItem = ({
    className,
    ...props
}: CustomNavbarMenuItemProps) => {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const connected = mounted && account && chain

                return (
                    <NavbarMenuItem className={className} {...props}>
                        {!mounted ? (
                            <div className="flex w-full gap-2 text-lg">
                                <Spinner size="sm" />
                                <p>Loading</p>
                            </div>
                        ) : !connected ? (
                            <Link
                                color="primary"
                                className="w-full"
                                href="#"
                                size="lg"
                                onClick={openConnectModal}
                            >
                                <div className="flex items-center gap-2">
                                    <WalletIcon className="w-6" />
                                    <p>Connect Wallet</p>
                                </div>
                            </Link>
                        ) : chain.unsupported ? (
                            <Link
                                color="danger"
                                className="w-full"
                                href="#"
                                size="lg"
                                onClick={openChainModal}
                            >
                                <div className="flex items-center gap-2">
                                    <AlertIcon className="w-6" />
                                    <p>Wrong Network</p>
                                </div>
                            </Link>
                        ) : (
                            <Link
                                className="w-full"
                                href="#"
                                color="success"
                                size="lg"
                                onClick={openAccountModal}
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={blockies
                                            .create({ seed: account.address })
                                            .toDataURL()}
                                        style={{
                                            borderRadius: 999,
                                            width: 24,
                                            height: 24,
                                        }}
                                    />
                                    <p>{account.displayName}</p>
                                </div>
                            </Link>
                        )}
                    </NavbarMenuItem>
                )
            }}
        </ConnectButton.Custom>
    )
}
