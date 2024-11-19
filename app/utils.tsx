export function secondsToLabel(value: number, noDays: boolean = false) {
    let rest = value

    let hours: number = 0
    let minutes: number = 0
    let seconds: number = 0

    if (rest > 0) {
        hours = Math.floor(rest / 3600)
        rest = rest % 3600

        minutes = Math.floor(rest / 60)
        seconds = rest % 60

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
            2,
            '0'
        )}:${String(seconds).padStart(2, '0')}`
    } else {
        return 'Finished'
    }
}
