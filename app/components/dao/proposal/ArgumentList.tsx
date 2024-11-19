import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@nextui-org/react'
import { Dispatch, Key, SetStateAction, useCallback, useState } from 'react'
import { AddArgumentIcon, TrashIcon } from '~/components/icons'
import { ProposalArgument } from './ProposalActionArgumentType'
import { Button3D } from '~/components/buttons/Button3D'

type ArgumentListProps = {
    args: ProposalArgument[]
    setArgs: Dispatch<SetStateAction<ProposalArgument[]>>
}

export const ArgumentList = ({ args, setArgs }: ArgumentListProps) => {
    const [nextArgumentId, setNextArgumentId] = useState<number>(1)

    function onAddArgument() {
        const newArgument: ProposalArgument = {
            id: nextArgumentId,
            value: '',
        }

        setNextArgumentId(nextArgumentId + 1)
        setArgs((value) => [...value, newArgument])
    }

    function onDeleteArgument(argumentId: number) {
        setArgs((value) => value.filter((item) => item.id !== argumentId))
    }

    function onUpdateArgValue(arg: ProposalArgument, value: string) {
        arg.value = value
        onUpdateArgument(arg)
    }

    function onUpdateArgument(arg: ProposalArgument) {
        setArgs((value) =>
            value.map((item) => (item.id === arg.id ? arg : item))
        )
    }

    const renderCell = useCallback(
        (index: number, arg: ProposalArgument, columnKey: Key) => {
            switch (columnKey) {
                case 'id':
                    return (index + 1).toString()

                case 'value':
                    return (
                        <Input
                            className="border-2 border-solid border-gray-500 rounded-lg"
                            placeholder="Value"
                            onValueChange={(value) =>
                                onUpdateArgValue(arg, value)
                            }
                        />
                    )

                case 'actions':
                    return (
                        <Button
                            isIconOnly
                            color="danger"
                            radius="full"
                            size="sm"
                            variant="light"
                            onPress={() => onDeleteArgument(arg.id)}
                        >
                            <TrashIcon className="w-6" />
                        </Button>
                    )
            }
        },
        []
    )

    return (
        <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-row justify-between">
                <p className="content-center text-lg">Arguments</p>
                <Button3D onPress={() => onAddArgument()} color="success">
                    <AddArgumentIcon className="w-6" /> Add Argument
                </Button3D>
            </div>

            <Table aria-label="Example empty table">
                <TableHeader>
                    <TableColumn key="id">#</TableColumn>
                    <TableColumn width="100%" key="value">
                        Value
                    </TableColumn>
                    <TableColumn align="end" key="actions">
                        Actions
                    </TableColumn>
                </TableHeader>
                <TableBody emptyContent={'No arguments to display'}>
                    {args.map((arg, index) => (
                        <TableRow key={arg.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(index, arg, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
