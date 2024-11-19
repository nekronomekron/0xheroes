import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Input,
    Select,
    SelectItem,
    Selection,
    SharedSelection,
    Table,
    TableBody,
    TableColumn,
    TableHeader,
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { AddArgumentIcon, TrashIcon } from '~/components/icons'
import { ProposalAction } from './ProposalActionType'

import { Key } from '@react-types/shared'

import appConfig from '~/app.config.json'
import { ArgumentList } from './ArgumentList'
import { ProposalArgument } from './ProposalActionArgumentType'

type ActionItemProps = {
    action: ProposalAction
    onUpdateAction: (action: ProposalAction) => void
    onDeleteAction: (actionId: number) => void
}

export const ActionItem = ({
    action,
    onDeleteAction,
    onUpdateAction,
}: ActionItemProps) => {
    const [selectedTarget, setSelectedTarget] = useState<Selection>(
        new Set<Key>([action.target!])
    )

    const [functionName, setFunctionName] = useState<string>(action.function!)
    const [args, setArgs] = useState<ProposalArgument[]>(action.args)

    function onTargetContractChange(keys: SharedSelection) {
        action.target = keys.currentKey as `0x${string}`
        setSelectedTarget(new Set<Key>([keys.currentKey!]))

        onUpdateAction(action)
    }

    function onFunctionNameChange(functionName: string) {
        action.function = functionName
        setFunctionName(functionName)

        onUpdateAction(action)
    }

    useEffect(() => {
        action.args = args
        onUpdateAction(action)
    }, [args])

    return (
        <Card>
            <CardHeader className="justify-between">
                <p className="text-xl">Action #{action.id}</p>
                <Button
                    isIconOnly
                    color="danger"
                    radius="full"
                    size="sm"
                    variant="light"
                    onPress={() => onDeleteAction(action.id)}
                >
                    <TrashIcon className="w-6" />
                </Button>
            </CardHeader>
            <CardBody className="flex flex-1 flex-col gap-4">
                <Select
                    className="w-full rounded-lg border-2 border-solid border-gray-500"
                    isRequired
                    label="Target Contract"
                    labelPlacement="outside"
                    placeholder="Contract"
                    description={selectedTarget}
                    selectedKeys={selectedTarget}
                    onSelectionChange={onTargetContractChange}
                >
                    {Object.keys(appConfig.addresses).map((key: string) => (
                        <SelectItem
                            key={
                                appConfig.addresses[
                                    key as keyof typeof appConfig.addresses
                                ]
                            }
                        >
                            {key}
                        </SelectItem>
                    ))}
                </Select>

                <Input
                    className="border-2 border-solid border-gray-500 rounded-lg"
                    type="text"
                    label="Function Name"
                    placeholder="Function Name"
                    labelPlacement="outside"
                    isRequired
                    value={functionName}
                    onValueChange={onFunctionNameChange}
                />

                <ArgumentList args={args} setArgs={setArgs} />
            </CardBody>
        </Card>
    )
}
