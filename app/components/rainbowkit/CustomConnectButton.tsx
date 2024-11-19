import '@rainbow-me/rainbowkit/styles.css'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import * as blockies from 'blockies-ts'

import { Button3D, Button3DProps } from '../buttons/Button3D'
import { WalletIcon, AlertIcon } from '../icons'

type CustomConnectButtonProps = {} & Button3DProps

export const CustomConnectButton = ({
    className,
    ...props
}: CustomConnectButtonProps) => {
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
                    <>
                        {!mounted ? (
                            <Button3D
                                color="default"
                                isLoading
                                className={className}
                                {...props}
                            >
                                Loading
                            </Button3D>
                        ) : !connected ? (
                            <Button3D
                                onClick={openConnectModal}
                                color="primary"
                                className={className}
                                {...props}
                            >
                                <WalletIcon className="w-6" /> Connect Wallet
                            </Button3D>
                        ) : chain.unsupported ? (
                            <Button3D
                                onClick={openChainModal}
                                color="danger"
                                className={className}
                                {...props}
                            >
                                <AlertIcon className="w-6" /> Wrong network
                            </Button3D>
                        ) : (
                            <Button3D
                                color="success"
                                onClick={openAccountModal}
                                className={className}
                                {...props}
                            >
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
                                {account.displayName}
                            </Button3D>
                        )}
                    </>
                )
            }}
        </ConnectButton.Custom>
    )
}
