import { Dispatch, SetStateAction, useState } from 'react'
import { PlusIcon } from '~/components/icons'
import { ProposalAction } from './ProposalActionType'
import { ActionItem } from './ActionItem'
import { Button3D } from '~/components/buttons/Button3D'

type ActionListProps = {
    actions: ProposalAction[]
    setActions: Dispatch<SetStateAction<ProposalAction[]>>
}

export const ActionList = ({ actions, setActions }: ActionListProps) => {
    const [nextActionId, setNextActionId] = useState<number>(1)

    function onAddAction() {
        const newAction: ProposalAction = {
            id: nextActionId,
            target: undefined,
            function: undefined,
            args: [],
        }

        setNextActionId(nextActionId + 1)
        setActions((value) => [...value, newAction])
    }

    function onDeleteAction(actionId: number) {
        setActions((value) => value.filter((item) => item.id !== actionId))
    }

    function onUpdateAction(action: ProposalAction) {
        setActions((value) =>
            value.map((item) => (item.id === action.id ? action : item))
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-1 flex-row justify-between">
                <div className="flex flex-1 flex-col">
                    <p className="content-center text-xl">Actions</p>
                    <p
                        className={`text-small ${actions.length > 0 ? 'text-default-500' : 'text-danger-500'}`}
                    >
                        min. 1 action
                    </p>
                </div>

                <Button3D onPress={() => onAddAction()} color="success">
                    <PlusIcon className="w-6" /> Add Action
                </Button3D>
            </div>

            {actions.map((action, index) => (
                <ActionItem
                    key={index}
                    action={action}
                    onUpdateAction={onUpdateAction}
                    onDeleteAction={onDeleteAction}
                />
            ))}
        </div>
    )
}
