import { Link } from '@nextui-org/react'

import { GithubIcon, DiscordIcon, CommentDotsIcon } from '../icons'

import appConfig from '~/app.config.json'

type FooterProps = {}

export const Footer = ({}: FooterProps) => {
    return (
        <div className="container mx-auto max-w-7xl px-6 py-6 bg-black">
            <div className="sm:flex flex-1 text-white">
                <div className="grow flex flex-col gap-2 py-4">
                    <div>0xHeroes (c) 2024</div>
                    <Link
                        className="text-white text-small"
                        href="https://github.com/nekronomekron"
                        isExternal
                        showAnchorIcon
                    >
                        <div className="flex gap-2">
                            <GithubIcon className="w-6" />
                            <p>Github</p>
                        </div>
                    </Link>

                    <Link
                        className="text-white text-small"
                        href="https://discord.gg/WhtjASa8PM"
                        isExternal
                        showAnchorIcon
                    >
                        <div className="flex gap-2">
                            <DiscordIcon className="w-6" />
                            <p>Discord</p>
                        </div>
                    </Link>

                    <Link
                        className="text-white text-small"
                        href="https://t.me/OxHeroes"
                        isExternal
                        showAnchorIcon
                    >
                        <div className="flex gap-2">
                            <CommentDotsIcon className="w-6" />
                            <p>Telegram</p>
                        </div>
                    </Link>
                </div>

                <div className="grow flex flex-col gap-2 py-4">
                    <div>Contracts</div>
                    {Object.keys(appConfig.addresses).map((key: string) => (
                        <Link
                            className="text-white text-small"
                            key={
                                appConfig.addresses[
                                    key as keyof typeof appConfig.addresses
                                ]
                            }
                            href={`${appConfig['explorerUri']}/address/${appConfig.addresses[key as keyof typeof appConfig.addresses]}`}
                            isExternal
                            showAnchorIcon
                        >
                            {key}
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col gap-2 py-4">
                    <div>0xHeroes (c) 2024</div>
                </div>
            </div>
        </div>
    )
}
