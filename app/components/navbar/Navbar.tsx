import { useState } from 'react'
import {
    Navbar as NextuiNavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    Link,
    Button,
    NavbarMenu,
    NavbarMenuItem,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Divider,
} from '@nextui-org/react'

import { Key } from '@react-types/shared'
import { useNavigate } from '@remix-run/react'

import { SearchIcon, MenuIcon, ScriptIcon } from '../icons'

import { TreasuryButton } from '../treasury/TreasuryButton'

import { useAccount, useDisconnect } from 'wagmi'

import { CustomConnectButton } from '../rainbowkit/CustomConnectButton'
import { CustomNavbarMenuItem } from '../rainbowkit/CustomNavbarMenuItem'
import { UserGoldBalance } from '../user/UserGoldBalance'

const mainMenuItems = [
    {
        name: 'Explore',
        key: 'explore',
        icon: <SearchIcon className="w-6" />,
    },

    {
        name: 'DAO',
        key: 'dao',
        icon: <ScriptIcon className="w-6" />,
    },
]

const subMenuItems: {
    key: string
    label?: any
    icon?: any | null
    online?: boolean
    color?:
        | 'default'
        | 'danger'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
        | undefined
}[] = [
    {
        key: 'goldBalance',
        online: true,
    },
    {
        key: 'my-heroes',
        label: 'My Heroes',
        icon: null,
        color: 'default',
        online: true,
    },

    {
        key: 'divider',
        online: true,
    },

    {
        key: 'disconnect',
        label: 'Disconnect',
        icon: null,
        color: 'danger',
        online: true,
    },
]

export const Navbar = () => {
    const account = useAccount()
    const { disconnect } = useDisconnect()

    const navigate = useNavigate()

    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

    function handleAction(event: any, key: Key) {
        if (event !== null && event !== undefined) event.preventDefault()

        setIsMenuOpen(false)
        switch (key) {
            case 'disconnect':
                disconnect()
                break
            case 'my-heroes':
                navigate(`/users/${account!.address}`)
                break
            case 'explore':
            case 'dao':
                navigate(`/${key}`)
                break
            default:
                break
        }
    }

    return (
        <NextuiNavbar
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            maxWidth="full"
            isBlurred={false}
            isBordered={false}
        >
            <NavbarContent>
                <NavbarBrand>
                    <Link className="pe-2 text-3xl" href="/">
                        0xHeroes
                    </Link>
                    <TreasuryButton />
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="hidden gap-4 md:flex" justify="center">
                {mainMenuItems.map((item, index) => (
                    <NavbarItem key={`${item.name}-${index}`}>
                        <Link
                            isBlock
                            color="foreground"
                            className="w-full"
                            href="#"
                            size="lg"
                            onClick={(e) => handleAction(e, item.key)}
                        >
                            <div className="flex items-center gap-2">
                                {item.icon}
                                <p>{item.name}</p>
                            </div>
                        </Link>
                    </NavbarItem>
                ))}
            </NavbarContent>

            <NavbarContent justify="end">
                <CustomConnectButton className="hidden md:flex" />

                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            variant="light"
                            isIconOnly
                            className="hidden md:flex"
                        >
                            <MenuIcon className="w-6" />
                        </Button>
                    </DropdownTrigger>

                    <DropdownMenu
                        variant="faded"
                        aria-label="Dropdown menu with icons"
                        onAction={(key: Key) => handleAction(null, key)}
                        disabledKeys={['divider', 'goldBalance']}
                        items={subMenuItems}
                    >
                        {(item) =>
                            item.key === 'divider' ? (
                                <DropdownItem
                                    key={item.key}
                                    className={
                                        item?.online && !account.isConnected
                                            ? 'hidden'
                                            : ''
                                    }
                                >
                                    <Divider />
                                </DropdownItem>
                            ) : item.key === 'goldBalance' ? (
                                <DropdownItem
                                    key={item.key}
                                    className={`opacity-100 ${
                                        item?.online && !account.isConnected
                                            ? 'hidden'
                                            : ''
                                    }`}
                                >
                                    <UserGoldBalance owner={account.address} />
                                </DropdownItem>
                            ) : (
                                <DropdownItem
                                    key={item.key}
                                    startContent={item.icon}
                                    className={`${item.color !== 'default' ? `text-${item.color}` : ''} ${item?.online && !account.isConnected ? 'hidden' : ''}`}
                                    color={item.color}
                                >
                                    {item.label}
                                </DropdownItem>
                            )
                        }
                    </DropdownMenu>
                </Dropdown>

                <NavbarMenuToggle
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    className="md:hidden"
                    icon={<MenuIcon className="w-6" />}
                />
            </NavbarContent>

            <NavbarMenu>
                <CustomNavbarMenuItem />
                <UserGoldBalance owner={account.address} />

                <NavbarMenuItem>
                    <Divider />
                </NavbarMenuItem>

                {mainMenuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item.name}-${index}`}>
                        <Link
                            color="foreground"
                            className="w-full"
                            href="#"
                            size="lg"
                            onClick={(e) => handleAction(e, item.key)}
                        >
                            <div className="flex items-center gap-2">
                                {item.icon}
                                <p>{item.name}</p>
                            </div>
                        </Link>
                    </NavbarMenuItem>
                ))}

                {subMenuItems
                    .filter((item) => item.key !== 'goldBalance')
                    .map((item, index) =>
                        item.key === 'divider' ? (
                            <NavbarMenuItem
                                key={`${item.key}-${index}`}
                                className={
                                    item?.online && !account.isConnected
                                        ? 'hidden'
                                        : ''
                                }
                            >
                                <Divider />
                            </NavbarMenuItem>
                        ) : (
                            <NavbarMenuItem
                                key={`${item.key}-${index}`}
                                className={
                                    item?.online && !account.isConnected
                                        ? 'hidden'
                                        : ''
                                }
                            >
                                <Link
                                    color={
                                        item.color === 'danger'
                                            ? 'danger'
                                            : 'foreground'
                                    }
                                    className="w-full"
                                    size="lg"
                                    href="#"
                                    onClick={(e) => handleAction(e, item.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        <p>{item.label}</p>
                                    </div>
                                </Link>
                            </NavbarMenuItem>
                        )
                    )}
            </NavbarMenu>
        </NextuiNavbar>
    )
}
