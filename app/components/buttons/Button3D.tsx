import { Button, ButtonProps } from '@nextui-org/react'

export type Button3DProps = {} & ButtonProps

export const Button3D = ({ children, className, ...props }: Button3DProps) => {
    const classNameVariants = {
        default:
            'border-blue-300 [box-shadow:0_8px_0_0_#1f2937,0_15px_0_0_#f3f4f641] active:[box-shadow:0_0px_0_0_#1f2937,0_0px_0_0_#f3f4f641]',
        primary:
            'border-blue-300 [box-shadow:0_8px_0_0_#1e40af,0_15px_0_0_#dbeafe41] active:[box-shadow:0_0px_0_0_#1e40af,0_0px_0_0_#dbeafe41]',
        secondary: '',
        success:
            'border-green-300 [box-shadow:0_8px_0_0_#166534,0_15px_0_0_#dcfce741] active:[box-shadow:0_0px_0_0_#166534,0_0px_0_0_#dcfce741]',
        warning:
            'border-amber-300 [box-shadow:0_8px_0_0_#d97706,0_15px_0_0_#fde68a41] active:[box-shadow:0_0px_0_0_#d97706,0_0px_0_0_#fde68a41]',
        danger: 'border-red-300 [box-shadow:0_8px_0_0_#991b1b,0_15px_0_0_#fecaca41] active:[box-shadow:0_0px_0_0_#991b1b,0_0px_0_0_#fecaca41]',
    }

    return (
        <Button
            className={`mb-[8px] border-b-[1px] text-danger-foreground !transition-all duration-150 active:translate-y-2 active:border-b-[0px] data-[pressed=true]:scale-100 ${
                classNameVariants[
                    props.color === undefined ? 'success' : props.color
                ]
            } ${className}`}
            {...props}
        >
            {children}
        </Button>
    )
}
