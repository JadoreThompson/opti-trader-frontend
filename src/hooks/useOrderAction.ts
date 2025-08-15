import { AssertError } from '@sinclair/typebox/value'
import { useCallback, useState } from 'react'

const useOrderActions = () => {
    const [error, setError] = useState<string | null>(null)

    const submitAction = useCallback(
        async (
            endpoint: string,
            body: any,
            method: 'DELETE' | 'PATCH' = 'DELETE'
        ) => {
            setError(null)
            try {
                const response = await fetch(endpoint, {
                    method,
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                if (response.ok || response.status === 400) {
                    const data = await response.json()
                    if (!response.ok) {
                        throw new Error(data['error'])
                    }
                    return true
                }
                throw new Error('An unexpected error occurred.')
            } catch (err) {
                const message =
                    err instanceof AssertError
                        ? 'Invalid request'
                        : (err as Error).message

                setError(message)
                return false
            }
        },
        []
    )

    return { error, setError, submitAction }
}


export default useOrderActions